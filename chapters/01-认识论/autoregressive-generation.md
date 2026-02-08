# 自回归生成的本质

## 一个被忽略的事实

大模型生成文本的方式是：一次一个 token，每一个 token 的选择都以前面所有 token 为条件。

这不是实现细节，是本质属性。绝大多数关于大模型的工程讨论跳过了这个事实，直接进入"怎么用"。但如果不理解自回归生成的本质，就无法理解为什么 prompt 的微小变化会导致输出的巨大差异，为什么"相同的问题"会得到"不同的回答"，为什么某些任务对大模型来说轻而易举而另一些却始终做不好。

这些现象不是 bug，是自回归生成机制的直接推论。

## 条件概率分解

给定一个 token 序列 x = (x_1, x_2, ..., x_n)，自回归模型将其联合概率分解为：

P(x_1, x_2, ..., x_n) = P(x_1) * P(x_2|x_1) * P(x_3|x_1, x_2) * ... * P(x_n|x_1, ..., x_{n-1})

每一步生成都是一个条件概率分布上的采样。模型在给定前缀的条件下，为词表中的每一个 token 赋一个概率，然后从这个分布中选取下一个 token。

这个分解有两个关键含义。

**第一，生成是序列性的。** 每个 token 的选择依赖于前面所有 token 的选择。这意味着早期 token 的选择会约束后续所有 token 的概率分布。一旦第一句话走上了某个方向，后续的生成就被"锁定"在与这个方向一致的概率空间中。这和计算数学中初值问题的敏感性是同构的：初值的微小扰动，经过足够多步迭代后，可能导致轨迹的彻底偏离。

**第二，生成是局部的。** 模型在每一步只决定下一个 token，没有全局规划能力。它不会先构思一个完整的论证结构然后逐段填充——它只是在每一步选择概率最高（或被采样策略选中）的 token。如果最终输出呈现出连贯的结构，那是因为训练数据中的统计规律使得"连贯的结构"成为高概率的 token 序列，而不是因为模型在执行某种全局规划。

用一个代码示例来展示这个过程的核心逻辑：

```python
import numpy as np
from typing import Optional


def autoregressive_generate(
    model_forward: callable,
    prompt_tokens: list[int],
    max_new_tokens: int = 100,
    temperature: float = 1.0,
    top_p: float = 1.0,
    seed: Optional[int] = None,
) -> list[int]:
    """
    自回归生成的核心循环。

    这段代码不是伪代码，而是对真实推理过程的精确抽象。
    model_forward 接收 token 序列，返回词表上的 logits 向量。
    """
    rng = np.random.default_rng(seed)
    generated = list(prompt_tokens)

    for _ in range(max_new_tokens):
        # 模型只看到目前为止的所有 token
        logits = model_forward(generated)  # shape: (vocab_size,)

        # temperature 缩放：温度越低，分布越尖锐
        scaled_logits = logits / temperature

        # softmax 转换为概率分布
        probs = np.exp(scaled_logits - np.max(scaled_logits))
        probs = probs / probs.sum()

        # top-p (nucleus) 采样：只保留累积概率达到 top_p 的 token
        if top_p < 1.0:
            sorted_indices = np.argsort(probs)[::-1]
            cumsum = np.cumsum(probs[sorted_indices])
            cutoff_idx = np.searchsorted(cumsum, top_p) + 1
            mask = np.zeros_like(probs, dtype=bool)
            mask[sorted_indices[:cutoff_idx]] = True
            probs = np.where(mask, probs, 0.0)
            probs = probs / probs.sum()

        # 从概率分布中采样一个 token
        next_token = rng.choice(len(probs), p=probs)
        generated.append(int(next_token))

    return generated
```

这段代码揭示了一个关键事实：模型本身输出的是概率分布，不是答案。从分布到具体 token 的转换，是采样策略（temperature、top-p、top-k 等）决定的。同一个概率分布，在 temperature=0.0（贪心解码）和 temperature=1.0 下，可能产生完全不同的 token 序列。

## 采样策略不是调参，是设计决策

temperature 这个参数在大多数教程中被当作"创造性"的旋钮：调高更有创意，调低更准确。这个说法不是错误的，但过于简化，掩盖了更深层的工程含义。

temperature 本质上是在控制概率分布的熵。设 q_i 为 softmax 之前某个 token 的 logit 值，经过 temperature T 缩放后的概率为：

p_i = exp(q_i / T) / sum_j(exp(q_j / T))

当 T 趋近于 0 时，分布退化为确定性选择（概率全部集中在 logit 最大的 token 上）。当 T 趋近于无穷时，分布趋近于均匀分布（每个 token 等概率）。

这和统计物理中的玻尔兹曼分布是同一个数学结构。温度参数 T 控制的是系统在"有序"和"无序"之间的平衡点。这不是巧合——softmax 函数本身就是从统计力学借来的。

工程含义是：采样策略的选择不是一个可以事后微调的参数，而是一个需要在系统设计阶段做出的决策。它决定了系统的行为特征：

- 结构化数据提取（JSON 生成、实体识别）：需要低 temperature，甚至贪心解码。因为任务有唯一正确答案，高随机性只会引入错误。
- 创意写作、头脑风暴：需要较高 temperature。因为任务的价值恰恰在于探索概率空间中的非显然路径。
- 代码生成：通常需要中等偏低的 temperature。代码有语法和语义的硬约束，但在实现方式上允许一定的变化。

一个没有为不同任务类型设计不同采样策略的系统，和一个对所有数值计算都用同一种精度的程序一样，在某些场景下必然会出问题。

## 下一个 token 预测与"理解"的幻觉

自回归模型的训练目标是最大化训练数据的似然：对于每一个位置，给定前面的所有 token，预测下一个 token 的概率。整个训练过程就是在优化这个目标。

这个事实引出一个被反复争论的问题：大模型是否"理解"语言？

从工程角度看，这个哲学争论的结论并不重要。重要的是它的操作性推论：大模型生成的内容是训练数据中统计规律的投射，而不是某种独立推理过程的产物。

这个判断的工程后果是具体的：

**大模型会"编造"。** 当模型遇到一个在训练数据中缺少对应信息的问题时，它不会回答"我不知道"（除非被明确训练过这种行为），而是会生成一个在统计意义上"合理"的回答。这个回答在语法、风格、语气上都无可挑剔，唯独内容可能是虚构的。因为自回归生成的目标是生成高概率的 token 序列，而"听起来合理"的虚构内容和真实内容具有相似的概率分布。

**大模型的"推理"是模式匹配的涌现。** 当大模型展现出推理能力（比如数学证明、逻辑推演）时，它不是在执行形式化的推理步骤，而是在生成与训练数据中推理模式统计一致的 token 序列。这解释了为什么大模型在常见的推理模式上表现良好，但在稍微偏离常见模式的变体上会突然失败。模式匹配的边界不像形式化推理的边界那样清晰可预测。

**大模型对 prompt 的敏感性不是缺陷，是必然。** 由于每一步生成都以前面所有 token 为条件，prompt 的措辞变化——即便语义等价——会改变条件概率分布的形状。"请总结以下文本"和"对以下文本进行摘要"在语义上等价，但它们作为条件前缀，激活的是训练数据中不同的统计模式，因此可能引导出质量不同的续写。这就是序章中提到的"数值稳定性"问题在 LLM 领域的具象化：语义等价不等于行为等价。

理解这种敏感性的前提是具备对生成过程的可观测性。自回归生成的每一步都产生一个完整的概率分布，从中可以提取关键信号：该步的熵（反映模型在这个位置的不确定程度）、top-1 token 的概率（反映模型对最优选择的"信心"）、实际被选中的 token 是否是概率最高的那个（区分确定性行为和采样随机性的贡献）。这些信号将生成过程从一个黑箱的"输入-输出"映射转化为一条可观测的轨迹。当系统输出不符合预期时，排查方向不再是笼统地猜测"prompt 哪里写得不好"，而是回到轨迹本身：哪一步的熵突然升高，说明模型在该位置遭遇了高度不确定性；哪一步的实际选择偏离了 top-1，说明采样的随机性在这里起了决定性作用；从哪一步开始出现事实性错误的迹象，说明此前的 token 序列已经将概率分布引向了"幻觉"的子空间。这种逐步的可追溯性，是将 LLM 应用从"试了才知道"推向工程化的基础设施之一。

## 自回归的计算代价结构

自回归生成的时间复杂度与输出长度成线性关系：生成 n 个 token 需要 n 次前向传播。每次前向传播需要对整个前缀执行注意力计算（KV cache 可以缓解部分重复计算，但不改变基本的线性关系）。

这个代价结构的工程含义经常被低估：

**延迟与输出长度正相关。** 要求模型生成 1000 个 token 的响应，延迟大约是生成 100 个 token 的 10 倍。这意味着系统设计不能忽略输出长度的控制。一个没有明确输出长度约束的 prompt，是一个没有时间复杂度保证的算法。

**长输出的后半段质量倾向于下降。** 随着生成长度增加，条件前缀变长，每一步的条件概率分布受到越来越多历史 token 的影响。在实践中，这意味着长文本的后半段更容易出现重复、漂移或质量下降。这和数值迭代中的误差累积是同一类问题：每一步的小误差在长序列上会积累。

**并行化受限。** 自回归生成本质上是串行的——第 n+1 个 token 的生成必须等待第 n 个 token 确定。这与训练阶段（所有 token 可以并行计算损失）形成鲜明对比。推理时的这种串行性是大模型部署成本高昂的核心原因之一。

```python
def estimate_generation_cost(
    prompt_tokens: int,
    max_output_tokens: int,
    time_per_forward_ms: float,
    cost_per_1k_tokens: float,
) -> dict:
    """
    估算一次生成的时间和成本。

    这个粗略估算揭示的不是精确数字，
    而是代价结构的基本形状：输出长度是主要变量。
    """
    # 首次前向传播处理整个 prompt（prefill 阶段）
    prefill_time_ms = time_per_forward_ms * (prompt_tokens / 100)  # 近似

    # 后续每个 token 一次前向传播（decode 阶段）
    decode_time_ms = time_per_forward_ms * max_output_tokens

    total_time_ms = prefill_time_ms + decode_time_ms
    total_tokens = prompt_tokens + max_output_tokens
    total_cost = total_tokens / 1000 * cost_per_1k_tokens

    return {
        "prefill_time_ms": round(prefill_time_ms, 1),
        "decode_time_ms": round(decode_time_ms, 1),
        "total_time_ms": round(total_time_ms, 1),
        "total_tokens": total_tokens,
        "estimated_cost_usd": round(total_cost, 6),
        "decode_fraction": round(decode_time_ms / total_time_ms, 2),
    }


# 典型场景对比
short_task = estimate_generation_cost(
    prompt_tokens=500, max_output_tokens=50,
    time_per_forward_ms=15, cost_per_1k_tokens=0.03
)

long_task = estimate_generation_cost(
    prompt_tokens=500, max_output_tokens=2000,
    time_per_forward_ms=15, cost_per_1k_tokens=0.03
)

print(f"短输出任务: {short_task}")
print(f"长输出任务: {long_task}")
# 长输出任务的解码时间占比接近 100%，总时间是短输出的数十倍
```

## 对工程实践的直接推论

从自回归生成的本质，可以推导出几条对后续章节有直接影响的工程原则：

**prompt 设计的本质是控制条件概率分布的初始形状。** 好的 prompt 不是"说清楚你要什么"——这个说法太模糊。好的 prompt 是：通过精心构造的 token 前缀，将后续生成的概率分布约束到一个期望的子空间中。这个认识是第三章（提示工程作为软件工程）的出发点。

**输出格式约束是概率空间的降维。** 当你要求模型输出 JSON 格式时，你实质上在将后续 token 的有效概率空间从整个词表缩小到 JSON 语法允许的 token 子集。约束越精确，有效空间越小，模型的行为越可预测。这个认识是第四章（类型系统与契约）的出发点。

**每一次 LLM 调用都是一次采样，不是一次计算。** 对确定性函数，调用一次和调用十次得到的是相同的结果。对 LLM，同一个 prompt 的多次调用会产生一个输出分布。系统设计必须将这个分布纳入考量，而不是假设每次调用的输出都是"正确答案"。这个认识是第七章（测试与可靠性）的出发点。

**上下文窗口不是"内存"，是条件前缀的长度限制。** 把上下文窗口类比为"内存"会导致错误的工程直觉。内存是可以随机访问的，上下文窗口中的信息则通过注意力机制被"软编码"到条件概率分布中——靠近生成点的信息通常比远离生成点的信息有更大的影响权重（尽管注意力机制理论上可以关注任意位置）。这意味着信息在上下文中的位置不是无关紧要的工程细节，而是影响输出质量的关键变量。

这些推论不是独立的观点，而是从自回归生成这一个核心事实出发的逻辑展开。理解了这个核心事实，后续章节中的很多工程决策就不再是"经验法则"，而是"必然推论"。
