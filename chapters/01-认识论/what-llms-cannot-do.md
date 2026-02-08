# 大模型不擅长什么

## 比了解能力更重要的是了解边界

关于大模型能做什么的讨论已经铺天盖地了。每一次模型更新都伴随着新的 benchmark 刷新、新的能力展示、新的"震撼"。

这些讨论的盲区在于：对系统的工程设计而言，了解边界比了解能力更重要。知道大模型能写代码、能翻译、能总结，对架构设计的指导意义有限——这些是可以做的事情的列表，而列表每天都在变长。真正有工程价值的知识是：哪些事情大模型本质上做不好，而且这种做不好不是当前模型的临时局限，而是自回归生成机制和语言模型范式的结构性约束。

区分"当前做不好"和"本质上做不好"是关键。前者会随着模型规模和训练技术的进步而改善；后者不会，或者改善的代价高到不值得依赖。工程设计应该基于后者来划定大模型的职责边界，而不是基于前者来赌未来的改进。

## 精确计算

大模型不是计算器。这个判断不是对当前模型的吐槽，而是对自回归生成机制的结构性分析。

当要求大模型计算 "1,847 * 923" 时，模型的工作方式不是调用一个乘法器，而是生成一个在训练数据中与"乘法结果"这种模式统计一致的 token 序列。对于训练数据中频繁出现的简单计算（如 7 * 8 = 56），模型的"记忆"足以给出正确结果。但对于训练数据中未直接出现的计算，模型只能基于统计模式进行"推测"——而算术运算的正确答案是唯一的，任何偏离都是错误。

这和数值计算中的一个原则形成对照：精确计算应该用精确方法。用浮点数近似来做需要整数精确结果的运算是工程错误，用统计模式匹配来做需要精确结果的运算同样是工程错误。

```python
def demonstrate_calculation_boundary():
    """
    展示精确计算应该由确定性代码而非 LLM 承担。
    
    这不是一个 LLM 的"缺陷展示"，
    而是一个职责边界的设计原则演示。
    """
    
    # 错误的设计：让 LLM 承担计算
    # prompt = "计算 1847 * 923，直接给出数值结果"
    # response = llm.call(prompt)  # 可能返回正确结果，也可能不
    # 问题不在于准确率是 90% 还是 99%，
    # 而在于对精确计算来说，任何低于 100% 的准确率都不可接受
    
    # 正确的设计：LLM 负责理解意图，确定性代码负责计算
    class CalculationRequest:
        """LLM 的职责是从自然语言中提取计算意图。"""
        operation: str   # "multiply"
        operand_a: float  # 1847
        operand_b: float  # 923
    
    def execute_calculation(op: str, a: float, b: float) -> float:
        """确定性代码的职责是执行精确计算。"""
        operations = {
            "multiply": lambda x, y: x * y,
            "add": lambda x, y: x + y,
            "subtract": lambda x, y: x - y,
            "divide": lambda x, y: x / y if y != 0 else float("inf"),
        }
        return operations[op](a, b)
    
    # 1847 * 923 = 1,704,781
    result = execute_calculation("multiply", 1847, 923)
    assert result == 1_704_781  # 确定性，可断言
    return result
```

工程推论：当系统中涉及精确计算时，正确的架构是让 LLM 负责意图解析（从自然语言中提取出"做什么运算、对什么操作数"），让确定性代码负责执行。这个分工不是权宜之计，是基于两种计算范式各自本质属性的合理设计。

## 状态维护

大模型没有持久状态。每一次调用都是独立的——模型不记得上一次调用的内容，除非你把历史信息显式地放在上下文中。

这个事实在"对话"场景中被上下文窗口的机制部分掩盖了：通过将之前的对话历史放在 prompt 中，大模型看起来像是"记住"了之前的对话。但这种"记忆"本质上是把历史信息当作条件前缀——模型并没有一个可以读写的记忆存储，只是把历史当作生成下一步输出的条件。

这与真正的状态维护有本质区别：

**容量受限。** 上下文窗口有长度限制。当对话历史超过窗口长度时，早期信息会被截断。这意味着"记忆"是有损的，而且是以一种不可控的方式有损的——被截断的可能恰好是关键信息。

**无选择性注意。** 模型不能选择性地"记住"重要信息、"遗忘"不重要信息。所有在上下文中的信息都会影响注意力权重，包括噪声。在一个充满历史对话的上下文中，模型的注意力可能被不相关的早期内容分散，而不是集中在当前任务需要的关键信息上。

**无副作用。** 真正的状态系统可以执行副作用：写入数据库、更新变量、触发事件。LLM 调用没有副作用——它只是生成一段文本。如果需要状态更新，必须由外部代码来完成。

```python
from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class ExplicitStateManager:
    """
    LLM 应用中的状态管理应该是显式的、外部的、确定性的。
    
    LLM 不维护状态。状态由确定性代码维护，
    并在每次 LLM 调用时以结构化的形式注入上下文。
    """
    state: dict[str, Any] = field(default_factory=dict)
    history: list[dict[str, str]] = field(default_factory=list)
    
    def update(self, key: str, value: Any) -> None:
        """状态更新是确定性操作，不经过 LLM。"""
        self.state[key] = value
    
    def build_context(self, max_history: int = 10) -> str:
        """
        将当前状态和最近的历史构造为上下文。
        
        关键设计决策：
        1. 状态信息放在最前面（利用位置的注意力偏好）
        2. 历史记录只保留最近的 n 条（防止上下文膨胀）
        3. 状态是结构化的（而非自然语言描述）
        """
        state_section = "## 当前状态\n"
        for k, v in self.state.items():
            state_section += f"- {k}: {v}\n"
        
        recent_history = self.history[-max_history:]
        history_section = "## 最近对话\n"
        for entry in recent_history:
            history_section += f"[{entry['role']}]: {entry['content']}\n"
        
        return f"{state_section}\n{history_section}"
    
    def add_exchange(self, user_input: str, assistant_output: str) -> None:
        """记录一次对话交换。状态记录在 LLM 之外。"""
        self.history.append({"role": "user", "content": user_input})
        self.history.append({"role": "assistant", "content": assistant_output})
```

工程推论：任何需要跨调用状态维护的 LLM 应用，都必须有一个显式的、外部的状态管理层。依赖上下文窗口来"记住"状态，和依赖全局变量来管理状态一样脆弱——只是在 LLM 语境中，这种脆弱性更加难以调试。

## 实时性与时效性

大模型的知识截止于训练数据的时间点。这个事实的含义比表面看起来更深。

**知识截止不只是"不知道最近发生了什么"。** 更深层的问题是：模型无法区分它所知道的信息是否仍然有效。当模型回答"某公司的 CEO 是谁"时，它给出的是训练数据中的信息，但它无法知道这个信息是否已经过期。而且它不会说"我的信息截止于某个时间点，请核实"——它会以同样自信的语气给出过期信息和当前信息。

**实时性需求是系统级问题，不是模型级问题。** RAG（检索增强生成）是当前解决时效性问题的主流方案：在 LLM 调用之前，先从实时数据源检索相关信息，将其注入上下文。但 RAG 的设计复杂度远超"加一个检索步骤"——检索质量、信息冲突（检索结果与模型知识矛盾时怎么办）、上下文长度管理、时效性标注，每一个都是独立的工程挑战。这是第五章的核心议题之一。

## 一致性

大模型不保证一致性。这里的"一致性"有两个维度：

**跨调用一致性。** 同一个问题问两次，可能得到不同的答案。更微妙的是：两个逻辑上等价的问题（"A 比 B 好吗"和"B 比 A 差吗"）可能得到矛盾的答案。因为这两个问题虽然逻辑上等价，但作为 token 序列，它们激活的是不同的条件概率分布。

**内部一致性。** 在一次长输出中，模型可能在前半段和后半段给出矛盾的判断。这是因为自回归生成没有全局一致性约束——模型在每一步只优化"下一个 token 的概率"，而不是"整个输出的逻辑一致性"。

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class ConsistencyCheck:
    """
    一致性检查的结构。
    
    在确定性系统中，一致性是自动保证的——相同的计算路径必然产生相同的结果。
    在概率性系统中，一致性必须被显式检查和强制。
    """
    claim_a: str
    claim_b: str
    relationship: str  # "equivalent", "contradictory", "independent"
    
    @staticmethod
    def check_cross_call_consistency(
        prompt_variants: list[str],
        responses: list[str],
    ) -> dict[str, float]:
        """
        对语义等价的 prompt 变体，
        检查响应之间的一致性程度。
        
        返回值中的 consistency_score 反映的是
        "不同措辞的同一个问题，是否得到了一致的回答"。
        """
        # 在实际系统中，这里会用嵌入向量的余弦相似度
        # 或另一个 LLM 来判断语义一致性
        n_pairs = len(responses) * (len(responses) - 1) // 2
        if n_pairs == 0:
            return {"consistency_score": 1.0, "n_pairs_checked": 0}
        
        # 占位：实际实现需要语义相似度计算
        return {
            "n_variants": len(prompt_variants),
            "n_responses": len(responses),
            "n_pairs_checked": n_pairs,
            "consistency_score": -1.0,  # 需要实际计算
            "note": "一致性检查需要语义相似度度量，不能用字符串匹配",
        }
```

工程推论：当系统对一致性有要求时（比如合同生成、医疗建议、财务报告），不能依赖 LLM 的内在一致性，而必须在系统层面实施一致性检查。可能的手段包括：对关键判断进行多次采样取多数票、用逻辑规则检查输出的内部一致性、对同一个问题的不同措辞进行交叉验证。这些都是成本换可靠性的工程权衡。

## 忠实执行指令

大模型不是一个听话的执行器。它是一个在条件概率空间中采样的生成器，prompt 是条件，但不是命令。

**指令遵从是概率性的。** "请用 JSON 格式输出"——模型通常会遵从，但不是 100%。"请只输出答案，不要解释"——模型经常还是会附加解释。"请不要编造信息"——这个指令对模型行为的约束力取决于训练阶段的对齐程度，而不是指令本身的措辞。

**否定指令特别不可靠。** "不要做 X"这种指令的效果远不如"请做 Y"。这有一个统计上的解释：训练数据中包含大量"做 X"的模式，"不要做 X"这个指令虽然在语义上是否定的，但它在 token 层面引入了 X 的模式，反而可能增加生成 X 的概率。这和心理学中"不要想白色大象"的效应在结构上是同构的——注意力机制被引导向了你试图避免的方向。

**复杂指令的遵从率随指令数量增加而下降。** 一个包含 3 条约束的 prompt 比包含 10 条约束的 prompt 更可能被完全遵从。这不是因为模型"忘了"某些约束，而是因为多个约束之间可能存在概率上的张力——满足约束 A 的高概率 token 可能恰好违反约束 B。

```python
from pydantic import BaseModel, Field
from typing import Literal


# 反模式：用自然语言堆砌约束
FRAGILE_PROMPT = """
请分析以下文本的情感。
要求：
1. 输出必须是 JSON 格式
2. 必须包含 sentiment 字段，值为 positive/negative/neutral 之一
3. 必须包含 confidence 字段，值为 0 到 1 之间的小数
4. 必须包含 reasoning 字段，说明判断理由
5. reasoning 不超过 100 字
6. 不要输出 JSON 以外的任何内容
7. 不要添加 markdown 代码块标记
8. confidence 精确到小数点后两位
"""

# 正确做法：用类型系统表达约束，让约束成为可执行的规格说明
class SentimentAnalysis(BaseModel):
    """
    类型定义本身就是最精确的 prompt。
    
    这个类的定义比上面的 8 条自然语言约束更精确、更可验证、
    更不容易被模型"误解"。
    
    更重要的是：即使模型的输出有偏差，
    Pydantic 的验证器会在解析时捕获违规，
    而自然语言约束的违规只能通过事后检查发现。
    """
    sentiment: Literal["positive", "negative", "neutral"]
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str = Field(max_length=100)
```

## 可靠的自我评估

大模型不擅长评估自己输出的质量。当你问模型"你确定这个回答是正确的吗"，模型的回答不是基于对自身推理过程的审视，而是基于"在这种对话模式下，下一个最可能的 token 是什么"。模型说"我很确定"不意味着它真的"确定"——"我很确定"只是一个高概率的续写。

这个观察的工程含义是：不要把 LLM 的自我评估作为质量保障的手段。"请检查你的回答是否正确"这种 prompt 的效果是不可靠的——它可能触发模型输出"经过检查，我的回答是正确的"这个高概率续写，而不是真正执行了某种自检。

可靠的质量评估需要外部手段：独立的验证逻辑、另一个模型的交叉检查、人工审核、或者基于规则的约束检查。第七章将详细讨论这些手段。

## 边界认知的工程价值

理解大模型不擅长什么，直接指向一个架构原则：大模型的最佳定位是系统中"理解意图"和"生成自然语言"的组件，而不是"执行计算"或"维护状态"或"保证一致性"的组件。

用一个类比来总结：大模型像一个知识渊博但不可完全信赖的顾问。你会向顾问咨询建议、请顾问起草文件、让顾问翻译材料——但你不会让顾问保管你的存折、替你做精确计算、或者保证他今天说的话和昨天完全一致。

这个类比指向的系统架构是：

- LLM 负责：意图解析、自然语言生成、文本转换、模式识别、知识查询。
- 确定性代码负责：精确计算、状态管理、一致性保障、安全检查、业务规则执行。
- 两者之间通过类型化的契约接口连接：LLM 的输出必须满足预定义的类型约束，确定性代码的输入来自经过验证的 LLM 输出。

```python
from dataclasses import dataclass
from typing import Protocol


class IntentParser(Protocol):
    """LLM 的职责：从自然语言中解析结构化意图。"""
    def parse(self, natural_language_input: str) -> dict: ...


class BusinessLogic(Protocol):
    """确定性代码的职责：执行精确的业务逻辑。"""
    def execute(self, structured_intent: dict) -> dict: ...


class ResponseGenerator(Protocol):
    """LLM 的职责：将结构化结果转化为自然语言响应。"""
    def generate(self, structured_result: dict) -> str: ...


@dataclass
class HybridSystem:
    """
    混合架构：LLM 处理模糊性，确定性代码处理精确性。
    
    这不是一个"用 LLM 的地方少一点"的保守策略，
    而是一个让每个组件做自己最擅长的事的合理分工。
    """
    intent_parser: IntentParser        # LLM
    business_logic: BusinessLogic      # 确定性代码
    response_generator: ResponseGenerator  # LLM
    
    def handle_request(self, user_input: str) -> str:
        # 第一步：LLM 将模糊的自然语言转化为精确的结构化意图
        intent = self.intent_parser.parse(user_input)
        
        # 第二步：确定性代码执行精确的业务逻辑
        result = self.business_logic.execute(intent)
        
        # 第三步：LLM 将精确的结构化结果转化为友好的自然语言
        response = self.response_generator.generate(result)
        
        return response
```

这个三段式架构（LLM -> 确定性代码 -> LLM）不是唯一的模式，但它揭示了一个通用原则：让模糊性和精确性各归其位。大模型擅长处理模糊性（自然语言理解和生成），确定性代码擅长处理精确性（计算、状态、一致性）。把两者混为一谈——让 LLM 做计算，或者让确定性代码理解自然语言——是错配，不是创新。

这个边界认知是第五章（架构模式）讨论 LLM 定位问题的出发点，也是全书反复强调的核心判断之一：大模型不是万能的，而了解"不万能"的精确边界，比泛泛地知道"很厉害"有用得多。
