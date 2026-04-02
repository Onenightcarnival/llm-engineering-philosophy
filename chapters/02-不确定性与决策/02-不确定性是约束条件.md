# 不确定性不是敌人，是约束条件

## 一个来自金融市场的认识论

波动性不是市场的缺陷，是市场的本质属性。

这个认识在投资领域花了几十年才被广泛接受。早期的金融理论试图消除波动性——认为价格偏离"内在价值"是市场的"噪声"，是应该被过滤掉的。后来的认识是：波动性就是价格发现的过程本身。没有波动性，就没有流动性；没有流动性，市场就失去了功能。试图消除波动性，等于试图消除市场。

概率性输出之于 LLM，正如波动性之于市场。它不是一个可以被修复的 bug，而是自回归生成机制的本质产物。[第一章](../01-认识论/autoregressive-generation.md)已经从数学层面证明了这一点：每一步生成都是条件概率分布上的采样，概率性是写在机制里的，不在机制外面。

工程师面对概率性输出的本能反应通常是"怎么消除它"。这个反应和早期金融学者面对波动性的反应一样，方向就是错的。正确的问题不是"怎么消除不确定性"，而是"在给定的不确定性水平下，怎么设计出可靠的系统"。

## 从消除到管理：范式的转换

消除不确定性和管理不确定性是两种根本不同的工程范式。

**消除范式假设不确定性是偶然的。** 在这个范式下，系统的理想状态是确定性的，不确定性是偏离理想状态的"噪声"。工程努力的方向是消除噪声：写更好的 prompt、选更好的模型、用更低的 temperature——目标是让 LLM 的输出尽可能接近确定性函数。

**管理范式假设不确定性是本质的。** 在这个范式下，系统需要在不确定性存在的条件下正常工作。工程努力的方向不是消除不确定性，而是设计能容忍不确定性的架构：验证层、降级策略、冗余机制、人工回退——目标是让系统在 LLM 输出不完美的情况下依然可靠。

这两种范式的区别不是学术性的，它导致截然不同的系统架构。

消除范式下的代码是简短的。LLM 返回什么就用什么，没有验证，没有降级，没有防护。当输出不符合预期时，工程师的反应是"prompt 还需要优化"——然后陷入永无止境的 prompt 调优循环。这个循环之所以永无止境，是因为它试图用战术手段解决一个本质性的约束：无论 prompt 写得多好，单次调用的输出在统计意义上永远是概率性的。把系统的正确性完全押注在 LLM 输出的确定性上，等于把房子建在一个从设计上就会晃动的地基上，然后反复粉刷墙面来"解决"裂缝问题。

管理范式下的代码是更长的。它包含输出验证（结构层面和语义层面）、重试逻辑、降级方案、元数据追踪。每一步都假设上一步可能失败。LLM 的输出首先被解析，然后被验证，验证不通过则重试，重试耗尽则降级到一个确定性的兜底方案。整个流程返回的不仅是结果本身，还包括过程的元数据——尝试了几次、是否触发了降级——因为在不确定性环境下，"结果是怎么来的"和"结果是什么"同样重要。

消除范式的代码简短，因为它不处理失败情况。管理范式的代码更长，但这个长度不是"过度工程"——它是不确定性环境下的必要工程量。

## 不确定性作为约束条件的形式化

在计算数学中，约束条件不是问题的障碍，而是问题的定义的一部分。没有约束的优化问题要么无解，要么解是平凡的。约束的存在使得问题有了结构，结构使得问题可解。

不确定性可以被形式化为一组约束条件：

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class UncertaintyConstraints:
    """
    将不确定性形式化为系统设计的约束条件。

    这些约束不是"坏事"——它们是问题空间的精确描述。
    好的架构是在这些约束下的最优解，
    而不是无视这些约束的理想化方案。
    """

    # 单次调用的可靠性上限
    # 即使是最好的 prompt + 最好的模型，单次调用也有失败概率
    single_call_reliability: float  # 例如 0.95

    # 输出变异性
    # 同一输入的多次调用，输出的一致性程度
    output_consistency: float  # 0.0（每次完全不同）到 1.0（每次完全相同）

    def cascade_reliability(self, n_steps: int) -> float:
        """n 步串联的系统可靠性。"""
        return self.single_call_reliability ** n_steps

    def required_redundancy(self, target_reliability: float) -> int:
        """
        要达到目标可靠性，需要多少次独立调用（取最佳结果）。

        假设 n 次独立调用，至少一次成功的概率：
        P(至少一次成功) = 1 - (1 - p)^n

        解出 n: n = log(1 - target) / log(1 - p)
        """
        from math import ceil, log
        if self.single_call_reliability >= target_reliability:
            return 1
        if self.single_call_reliability <= 0:
            return float("inf")

        n = log(1 - target_reliability) / log(1 - self.single_call_reliability)
        return ceil(n)


# 典型场景的约束分析
classification_constraints = UncertaintyConstraints(
    single_call_reliability=0.92,
    output_consistency=0.85,
)

generation_constraints = UncertaintyConstraints(
    single_call_reliability=0.78,
    output_consistency=0.40,
)

print("分类任务:")
print(f"  3 步串联可靠性: {classification_constraints.cascade_reliability(3):.1%}")
print(f"  达到 99% 可靠性需要的冗余调用: {classification_constraints.required_redundancy(0.99)}")
print()
print("生成任务:")
print(f"  3 步串联可靠性: {generation_constraints.cascade_reliability(3):.1%}")
print(f"  达到 99% 可靠性需要的冗余调用: {generation_constraints.required_redundancy(0.99)}")
```

这个形式化揭示了一个关键洞察：冗余是管理不确定性的基本工具。如果单次调用的可靠性是 92%，三次独立调用取最佳结果的可靠性是 1 - (1-0.92)^3 = 99.95%。这个计算告诉架构师：与其追求单次调用的完美（从 92% 提升到 99% 可能需要重写整个 prompt 体系），不如通过冗余调用来达到同样的可靠性目标（成本增加 3 倍，但架构简单、可预测）。

这和投资中的分散化逻辑完全同构：与其试图找到一只完美的股票，不如持有一个分散的组合。每只股票的不确定性不变，但组合的不确定性通过分散化大幅降低。

## 不确定性预算

如果不确定性是约束条件，那么系统对不确定性的容忍能力就是一种有限的资源——可以称之为"不确定性预算"。

系统的不确定性预算取决于业务场景。一个内部文档搜索工具的不确定性预算很高——偶尔返回不太相关的结果，用户可以接受。一个自动交易系统的不确定性预算接近于零——每一个决策都有即时的财务后果。

关键的工程决策是：如何分配这个预算。

```python
from dataclasses import dataclass


@dataclass
class UncertaintyBudget:
    """
    系统的不确定性预算。

    类比财务预算：总预算是固定的，
    分配到各个环节的预算之和不能超过总预算。

    如果系统能容忍 5% 的失败率（不确定性预算 = 0.05），
    而系统有 3 个 LLM 调用环节，
    那么每个环节分配到的失败率预算约为 1.7%
    （因为 0.983^3 ≈ 0.95）。
    """
    total_failure_budget: float  # 系统级可接受失败率
    n_uncertain_steps: int       # 系统中不确定性步骤的数量

    @property
    def per_step_budget(self) -> float:
        """每个步骤分配到的失败率预算。"""
        if self.n_uncertain_steps == 0:
            return self.total_failure_budget
        # 独立步骤串联: (1 - per_step)^n = 1 - total
        # per_step = 1 - (1 - total)^(1/n)
        return 1 - (1 - self.total_failure_budget) ** (1 / self.n_uncertain_steps)

    def is_feasible(self, step_reliabilities: list[float]) -> dict:
        """
        给定每个步骤的实际可靠性，
        判断系统是否在不确定性预算内。
        """
        system_reliability = 1.0
        for r in step_reliabilities:
            system_reliability *= r

        actual_failure_rate = 1 - system_reliability
        within_budget = actual_failure_rate <= self.total_failure_budget

        return {
            "system_reliability": round(system_reliability, 4),
            "actual_failure_rate": round(actual_failure_rate, 4),
            "budget": self.total_failure_budget,
            "within_budget": within_budget,
            "margin": round(self.total_failure_budget - actual_failure_rate, 4),
        }


# 场景：一个 3 步 LLM 流水线，系统容忍 5% 失败率
budget = UncertaintyBudget(total_failure_budget=0.05, n_uncertain_steps=3)
print(f"每步失败率预算: {budget.per_step_budget:.2%}")
print(f"即每步可靠性需达到: {1 - budget.per_step_budget:.4f}")

# 检查实际可行性
actual = budget.is_feasible([0.95, 0.98, 0.97])
print(f"\n实际可靠性: {actual}")
# 如果不在预算内，战略选项是：
# 1. 减少步骤数（Strategy > Analysis）
# 2. 为关键步骤增加冗余
# 3. 降低业务对可靠性的要求（重新谈判预算）
# 不是：4. 把每一步的 prompt 优化到极致
```

不确定性预算的概念揭示了一个经常被忽略的权衡：增加系统中 LLM 调用的步骤数，会消耗不确定性预算。一个 10 步的 Agent 流水线，即使每步可靠性高达 98%，系统级可靠性也只有 81.7%。这不是一个可以通过"写更好的 prompt"来解决的问题——它是概率论的数学约束。正确的应对是在架构层面减少步骤数，而不是在 prompt 层面追求每步的极致可靠性。

## 防御性架构模式

接受不确定性作为约束条件后，系统架构的设计重心从"追求正确"转向"容忍错误"。以下是几种在不确定性环境下被证明有效的架构模式。

**验证-重试模式。** LLM 的输出经过结构化验证，不通过则重试。这个模式的前提是：LLM 的失败在统计上是独立的（或近似独立的），重试可以期望获得不同的结果。

```python
from pydantic import BaseModel, ValidationError
from typing import TypeVar, Type, Optional, Callable

T = TypeVar("T", bound=BaseModel)


def validated_llm_call(
    prompt: str,
    output_type: Type[T],
    llm_call: Callable[[str], str],
    max_retries: int = 3,
    modify_prompt_on_retry: Optional[Callable[[str, int], str]] = None,
) -> tuple[Optional[T], dict]:
    """
    验证-重试模式的实现。

    核心逻辑：
    1. 调用 LLM
    2. 尝试将输出解析为目标类型
    3. 解析失败则重试（可选地修改 prompt）
    4. 超过重试次数则返回 None

    这个模式有效的数学前提：
    如果单次失败率为 p，n 次独立重试后的失败率为 p^n。
    当 p=0.1, n=3 时，最终失败率为 0.001。
    """
    metadata = {
        "attempts": 0,
        "parse_errors": [],
        "success": False,
    }

    current_prompt = prompt
    for attempt in range(max_retries):
        metadata["attempts"] = attempt + 1

        raw_output = llm_call(current_prompt)

        try:
            parsed = output_type.model_validate_json(raw_output)
            metadata["success"] = True
            return parsed, metadata
        except ValidationError as e:
            metadata["parse_errors"].append(str(e))
            if modify_prompt_on_retry:
                current_prompt = modify_prompt_on_retry(prompt, attempt + 1)

    return None, metadata
```

**降级策略模式。** 当 LLM 输出不可用时，系统不是失败，而是降级到一个质量较低但确定性的方案。

```python
from dataclasses import dataclass
from typing import Generic, TypeVar, Callable, Optional

T = TypeVar("T")


@dataclass
class DegradationChain(Generic[T]):
    """
    降级链：从最高质量到最低质量的方案序列。

    每个方案比前一个的质量低但可靠性高。
    系统按顺序尝试，直到某个方案成功。

    这个模式的本质是：用质量的可控降级
    换取可用性的确定性保障。
    """
    strategies: list[tuple[str, Callable[..., Optional[T]]]]

    def execute(self, *args, **kwargs) -> tuple[T, str]:
        """
        按降级优先级执行策略。
        返回结果和使用的策略名称。
        """
        for name, strategy in self.strategies:
            try:
                result = strategy(*args, **kwargs)
                if result is not None:
                    return result, name
            except Exception:
                continue

        raise RuntimeError(
            f"所有 {len(self.strategies)} 个降级策略都失败了。"
            "这意味着降级链的设计不够完备——"
            "最后一级应该是一个永不失败的兜底方案。"
        )


# 示例：文本摘要的降级链
def llm_summary(text: str) -> Optional[str]:
    """最高质量：LLM 生成摘要。可能失败。"""
    # 实际实现中调用 LLM
    ...

def extractive_summary(text: str) -> Optional[str]:
    """中等质量：提取式摘要，取前 3 句。确定性。"""
    sentences = text.split("。")
    if len(sentences) >= 3:
        return "。".join(sentences[:3]) + "。"
    return text[:200]

def truncation_summary(text: str) -> str:
    """最低质量：直接截断。永不失败。"""
    return text[:100] + "..." if len(text) > 100 else text


summary_chain = DegradationChain(
    strategies=[
        ("llm_summary", llm_summary),
        ("extractive_summary", extractive_summary),
        ("truncation", truncation_summary),
    ]
)
```

**多数投票模式。** 对同一输入进行多次 LLM 调用，取多数一致的结果。适用于输出是离散类别的场景（分类、判断、选择）。

```python
from collections import Counter
from typing import TypeVar, Callable
from dataclasses import dataclass

T = TypeVar("T")


@dataclass(frozen=True)
class MajorityVoteResult(Generic[T]):
    """多数投票的结果。"""
    winner: T
    votes: dict  # 每个选项的得票数
    total_votes: int
    agreement_ratio: float  # 最高票数 / 总票数


def majority_vote(
    call_fn: Callable[[], T],
    n_calls: int = 3,
    min_agreement: float = 0.5,
) -> MajorityVoteResult[T]:
    """
    多数投票机制。

    核心假设：LLM 的正确输出是高概率事件，
    错误输出是低概率且分散的。
    因此多次采样取众数可以提高可靠性。

    这个假设在分类任务中通常成立，
    在生成任务中通常不成立（因为"正确"的生成不唯一）。
    """
    results = [call_fn() for _ in range(n_calls)]
    counter = Counter(str(r) for r in results)

    winner_str, winner_count = counter.most_common(1)[0]
    agreement = winner_count / n_calls

    # 找到原始对象
    winner = next(r for r in results if str(r) == winner_str)

    return MajorityVoteResult(
        winner=winner,
        votes=dict(counter),
        total_votes=n_calls,
        agreement_ratio=agreement,
    )
```

## 不确定性管理的成本模型

管理不确定性不是免费的。每一种管理手段都有成本，正确的工程决策需要在可靠性和成本之间找到平衡。

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class ReliabilityCostTradeoff:
    """
    可靠性与成本的权衡模型。

    每一种提升可靠性的手段都有成本。
    工程决策是在给定预算下最大化可靠性，
    或在给定可靠性目标下最小化成本。
    """
    base_reliability: float      # 单次调用的基础可靠性
    cost_per_call: float         # 单次调用的成本（美元）
    latency_per_call_ms: float   # 单次调用的延迟（毫秒）

    def retry_cost(self, max_retries: int) -> dict:
        """重试策略的成本分析。"""
        # 期望调用次数 = sum(p_fail^k for k in range(max_retries)) 的逆
        p_fail = 1 - self.base_reliability
        expected_calls = sum(p_fail ** k for k in range(max_retries))
        effective_reliability = 1 - p_fail ** max_retries

        return {
            "max_retries": max_retries,
            "effective_reliability": round(effective_reliability, 6),
            "expected_calls": round(expected_calls, 2),
            "expected_cost": round(expected_calls * self.cost_per_call, 4),
            "expected_latency_ms": round(expected_calls * self.latency_per_call_ms, 1),
            "worst_case_latency_ms": max_retries * self.latency_per_call_ms,
        }

    def voting_cost(self, n_votes: int) -> dict:
        """多数投票策略的成本分析。"""
        # 多数投票总是调用 n 次（并行）
        # 可靠性计算更复杂，这里简化为至少 ceil(n/2) 次正确
        from math import comb, ceil
        k_min = ceil(n_votes / 2)
        p = self.base_reliability
        reliability = sum(
            comb(n_votes, k) * p**k * (1-p)**(n_votes-k)
            for k in range(k_min, n_votes + 1)
        )

        return {
            "n_votes": n_votes,
            "effective_reliability": round(reliability, 6),
            "total_cost": round(n_votes * self.cost_per_call, 4),
            "latency_ms": self.latency_per_call_ms,  # 并行执行
            "cost_multiplier": n_votes,
        }


# 成本分析示例
tradeoff = ReliabilityCostTradeoff(
    base_reliability=0.92,
    cost_per_call=0.01,
    latency_per_call_ms=500,
)

print("重试策略:")
for retries in [1, 2, 3, 5]:
    r = tradeoff.retry_cost(retries)
    print(f"  {retries} 次重试: 可靠性 {r['effective_reliability']:.4%}, "
          f"期望成本 ${r['expected_cost']}, "
          f"最坏延迟 {r['worst_case_latency_ms']}ms")

print("\n多数投票策略:")
for votes in [3, 5, 7]:
    v = tradeoff.voting_cost(votes)
    print(f"  {votes} 票: 可靠性 {v['effective_reliability']:.4%}, "
          f"成本 ${v['total_cost']}, "
          f"延迟 {v['latency_ms']}ms (并行)")
```

这个成本模型揭示了一个重要的决策支点：重试策略在延迟上的代价是串行累加的（最坏情况下延迟翻倍），但成本的期望值增加有限（因为大多数时候第一次就成功了）。多数投票策略在成本上是固定的倍增，但如果可以并行执行，延迟不增加。选择哪种策略取决于系统的核心约束是成本还是延迟。

## 接受约束后的工程自由

不确定性作为约束条件被显式化之后，工程设计反而获得了更大的自由度。

不再需要追求"完美的 prompt"——因为系统的可靠性不依赖于单次调用的完美。不再需要焦虑模型的偶尔失误——因为验证层和降级策略会处理它。不再需要在每个新模型发布时恐慌——因为系统架构的有效性不依赖于特定模型的特定行为。

这和投资中的一个认识平行：一旦接受了"短期波动不可预测"这个约束，投资者反而获得了自由——不需要盯盘、不需要预测明天的涨跌、不需要为每一次回调焦虑。约束的显式化消除了无谓的挣扎，让注意力集中在真正可控的变量上。

对 LLM 工程而言，真正可控的变量是：系统架构、验证逻辑、降级策略、监控体系。不确定性存在于 LLM 的输出中，但可靠性存在于包裹 LLM 的工程结构中。把工程努力从前者转移到后者，是从"消除范式"到"管理范式"的根本转向。
