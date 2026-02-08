# 决策的数学结构

## 工程决策不是品味问题

"我们团队觉得 Claude 比 GPT 好用。""我个人偏好用 RAG 而非 fine-tune。""这个 prompt 感觉比那个好。"

这些表述的共同问题是：它们用主观感受替代了可量化的分析。工程决策——选择模型 A 还是模型 B、采用架构 X 还是架构 Y、投入资源优化 prompt 还是改进验证层——可以被形式化为数学优化问题。形式化不保证得到"完美"答案，但它能做到两件事：把隐含的假设显式化，把模糊的权衡量化。

计算数学训练带来的核心能力不是会解方程，而是一种将模糊问题精确化的直觉：定义变量、建立约束、构建目标函数、求解或证明无解。

## 期望值框架

最基础的决策工具是期望值。一个决策的期望价值等于所有可能结果的价值乘以各自概率的加权和。

```python
from dataclasses import dataclass, field
from typing import Optional


@dataclass(frozen=True)
class Outcome:
    """一个可能的结果。"""
    description: str
    probability: float  # 0 到 1
    value: float        # 正值表示收益，负值表示损失


@dataclass(frozen=True)
class Decision:
    """
    一个工程决策的期望值模型。

    用途不在于计算出精确的期望值——
    概率和价值的估计本身就有不确定性。
    用途在于迫使决策者把隐含的假设显式化：
    你认为有哪些可能的结果？
    你给每个结果赋予了什么概率？
    你如何量化每个结果的价值？
    """
    name: str
    outcomes: tuple[Outcome, ...]
    fixed_cost: float = 0.0  # 不管结果如何都要付出的成本

    @property
    def expected_value(self) -> float:
        return sum(o.probability * o.value for o in self.outcomes) - self.fixed_cost

    @property
    def variance(self) -> float:
        ev = self.expected_value + self.fixed_cost  # 不含固定成本的期望值
        return sum(
            o.probability * (o.value - ev) ** 2
            for o in self.outcomes
        )

    @property
    def worst_case(self) -> float:
        return min(o.value for o in self.outcomes) - self.fixed_cost

    @property
    def best_case(self) -> float:
        return max(o.value for o in self.outcomes) - self.fixed_cost

    def probability_check(self) -> bool:
        """概率之和应为 1。"""
        total = sum(o.probability for o in self.outcomes)
        return abs(total - 1.0) < 1e-6


# 示例：选择模型 A（便宜但不稳定）还是模型 B（贵但稳定）
model_a = Decision(
    name="使用 GPT-4o-mini（便宜但准确率较低）",
    outcomes=(
        Outcome("准确率满足需求，系统正常运行", 0.70, 10000),
        Outcome("准确率不够，需要大量人工审核补救", 0.25, 2000),
        Outcome("严重错误导致客户投诉", 0.05, -5000),
    ),
    fixed_cost=500,  # 月度 API 成本
)

model_b = Decision(
    name="使用 GPT-4o（贵但准确率高）",
    outcomes=(
        Outcome("准确率满足需求，系统正常运行", 0.90, 10000),
        Outcome("准确率不够，需要少量人工审核", 0.08, 6000),
        Outcome("严重错误导致客户投诉", 0.02, -5000),
    ),
    fixed_cost=2000,  # 月度 API 成本
)

for decision in [model_a, model_b]:
    print(f"{decision.name}:")
    print(f"  期望值: ${decision.expected_value:,.0f}")
    print(f"  方差: {decision.variance:,.0f}")
    print(f"  最差情况: ${decision.worst_case:,.0f}")
    print(f"  最好情况: ${decision.best_case:,.0f}")
    print()
```

期望值框架的价值不在于输出的数字有多精确——输入的概率本身就是估计值。它的价值在于结构化思维：强制你列举所有可能的结果、为每个结果赋概率、为每个结果赋价值。这个过程会暴露出你之前没有意识到的假设。比如在上面的例子中，"严重错误导致客户投诉"这个结果的存在本身就是一个重要的发现——如果团队之前只考虑了"准确率"这个维度，他们可能忽略了失败的尾部风险。

## 期望值之外：方差和尾部风险

期望值是必要的但不充分的决策工具。两个期望值相同的决策可能有截然不同的风险特征。

```python
from dataclasses import dataclass
from math import sqrt


@dataclass(frozen=True)
class RiskAdjustedDecision:
    """
    风险调整后的决策评估。

    不仅看期望值（均值），
    还看方差（波动性）和尾部风险（极端情况）。

    这和投资中的夏普比率思想是同一个数学结构：
    回报除以风险，得到单位风险的回报。
    """
    decision: Decision
    risk_aversion: float = 1.0  # 风险厌恶系数，越大越看重稳定性

    @property
    def risk_adjusted_value(self) -> float:
        """
        风险调整后的价值 = 期望值 - 风险厌恶系数 * 标准差

        这是均值-方差优化框架的简化版。
        风险厌恶系数反映决策者对波动性的容忍度：
        - risk_aversion = 0: 只看期望值（风险中性）
        - risk_aversion = 1: 标准的风险调整
        - risk_aversion > 1: 高度厌恶风险
        """
        std = sqrt(self.decision.variance)
        return self.decision.expected_value - self.risk_aversion * std

    @property
    def conditional_value_at_risk(self) -> float:
        """
        条件风险价值（CVaR）：最差 10% 情况下的期望损失。

        这个指标比最差情况更有信息量，
        因为它不只看单个极端事件，
        而是看尾部区域的平均表现。

        在工程语境中：不只问"最坏能坏到什么程度"，
        而是问"当事情出差错时，平均会有多差"。
        """
        # 简化计算：对离散结果按价值排序，取最差的累积 10% 概率
        sorted_outcomes = sorted(self.decision.outcomes, key=lambda o: o.value)
        cumulative_prob = 0.0
        cumulative_value = 0.0
        threshold = 0.10

        for outcome in sorted_outcomes:
            if cumulative_prob >= threshold:
                break
            weight = min(outcome.probability, threshold - cumulative_prob)
            cumulative_value += weight * outcome.value
            cumulative_prob += outcome.probability

        if cumulative_prob > 0:
            return cumulative_value / min(cumulative_prob, threshold)
        return sorted_outcomes[0].value


# 对比两种架构决策
simple_arch = Decision(
    name="简单架构：单次 LLM 调用 + Pydantic 验证",
    outcomes=(
        Outcome("正常工作", 0.85, 8000),
        Outcome("偶尔需要人工干预", 0.12, 5000),
        Outcome("验证层捕获异常，降级处理", 0.03, 3000),
    ),
    fixed_cost=1000,
)

complex_arch = Decision(
    name="复杂架构：3 步 Agent + RAG + 多模型集成",
    outcomes=(
        Outcome("完美工作，功能强大", 0.50, 15000),
        Outcome("基本工作，偶有错误", 0.25, 7000),
        Outcome("某个组件失败，系统不可用", 0.15, -2000),
        Outcome("级联失败，调试困难，长时间宕机", 0.10, -8000),
    ),
    fixed_cost=3000,
)

for decision in [simple_arch, complex_arch]:
    rad = RiskAdjustedDecision(decision=decision, risk_aversion=1.0)
    print(f"{decision.name}:")
    print(f"  期望值: ${decision.expected_value:,.0f}")
    print(f"  风险调整值: ${rad.risk_adjusted_value:,.0f}")
    print(f"  尾部风险 (CVaR 10%): ${rad.conditional_value_at_risk:,.0f}")
    print()
```

这个分析可能揭示一个反直觉的结论：复杂架构的期望值可能更高（因为上限更高），但风险调整后的价值更低（因为方差大、尾部风险严重）。简单架构的上限不高，但下限也不低——它的价值分布更紧凑。

这和投资中的一个经典洞察完全对应：高波动性资产的期望回报可能很高，但风险调整后的回报（夏普比率）不一定高。同理，复杂架构的"可能性"很广，但在风险调整后，简单架构往往是更优的选择。

## 约束优化框架

更完整的决策建模需要引入约束条件。工程决策不是在无限资源下求最优，而是在成本、时间、可靠性等约束条件下求可行解。

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class EngineeringConstraints:
    """
    工程决策的约束条件集合。

    约束不是负担——约束是问题的一部分。
    没有约束的优化问题要么无解，要么解是平凡的。
    约束越精确，解空间越小，决策越清晰。
    """
    max_monthly_cost_usd: float
    max_latency_p99_ms: float
    min_reliability: float       # 系统级可靠性下限
    max_development_weeks: int
    team_size: int
    existing_competencies: tuple[str, ...]  # 团队已有的技术能力

    def is_feasible(self, solution: "SolutionCandidate") -> dict:
        """检查一个方案是否满足所有约束。"""
        checks = {
            "cost": solution.monthly_cost <= self.max_monthly_cost_usd,
            "latency": solution.p99_latency_ms <= self.max_latency_p99_ms,
            "reliability": solution.estimated_reliability >= self.min_reliability,
            "timeline": solution.development_weeks <= self.max_development_weeks,
            "competency": all(
                skill in self.existing_competencies
                for skill in solution.required_skills
            ),
        }
        return {
            "feasible": all(checks.values()),
            "checks": checks,
            "violated": [k for k, v in checks.items() if not v],
        }


@dataclass(frozen=True)
class SolutionCandidate:
    """一个候选方案的量化描述。"""
    name: str
    monthly_cost: float
    p99_latency_ms: float
    estimated_reliability: float
    development_weeks: int
    required_skills: tuple[str, ...]
    expected_value: float  # 预期业务价值


def rank_solutions(
    constraints: EngineeringConstraints,
    candidates: list[SolutionCandidate],
) -> list[dict]:
    """
    在约束条件下对方案排序。

    流程：
    1. 过滤不可行的方案
    2. 对可行方案按期望值排序

    这个简单的两步过程比大多数"直觉决策"更可靠，
    因为它不会被方案的"酷炫程度"或"技术新颖性"误导。
    """
    results = []
    for candidate in candidates:
        feasibility = constraints.is_feasible(candidate)
        results.append({
            "name": candidate.name,
            "feasible": feasibility["feasible"],
            "violated_constraints": feasibility["violated"],
            "expected_value": candidate.expected_value if feasibility["feasible"] else None,
        })

    # 可行方案按期望值降序排列
    feasible = [r for r in results if r["feasible"]]
    infeasible = [r for r in results if not r["feasible"]]
    feasible.sort(key=lambda r: r["expected_value"], reverse=True)

    return feasible + infeasible


# 示例：为客服系统选择技术方案
constraints = EngineeringConstraints(
    max_monthly_cost_usd=2000,
    max_latency_p99_ms=3000,
    min_reliability=0.95,
    max_development_weeks=6,
    team_size=2,
    existing_competencies=("python", "fastapi", "pydantic", "openai_api"),
)

candidates = [
    SolutionCandidate(
        name="方案 A：GPT-4o + Pydantic 验证 + 规则引擎降级",
        monthly_cost=1500, p99_latency_ms=2000,
        estimated_reliability=0.97, development_weeks=3,
        required_skills=("python", "pydantic", "openai_api"),
        expected_value=8500,
    ),
    SolutionCandidate(
        name="方案 B：多模型集成 + RAG + Agent 编排",
        monthly_cost=4000, p99_latency_ms=5000,
        estimated_reliability=0.88, development_weeks=10,
        required_skills=("python", "langchain", "vector_db", "openai_api"),
        expected_value=12000,
    ),
    SolutionCandidate(
        name="方案 C：Claude + 简单 prompt + 人工审核兜底",
        monthly_cost=800, p99_latency_ms=1500,
        estimated_reliability=0.96, development_weeks=2,
        required_skills=("python", "fastapi"),
        expected_value=7000,
    ),
]

ranked = rank_solutions(constraints, candidates)
for i, r in enumerate(ranked):
    status = "可行" if r["feasible"] else f"不可行 (违反: {r['violated_constraints']})"
    ev = f"期望值 ${r['expected_value']:,}" if r["expected_value"] else "N/A"
    print(f"#{i+1} {r['name']}")
    print(f"   状态: {status}, {ev}")
    print()
```

方案 B 的期望值最高，但它违反了成本约束、延迟约束、可靠性约束和开发时间约束。在约束优化的框架下，它根本不在可行域内——无论它的期望值有多高。这就是约束优化的价值：它不会被"理论上最好"的方案迷惑，而是找到"在实际约束下最好"的方案。

## 条件概率与贝叶斯更新

工程决策中一个常被忽略的维度是：决策应该随着新信息的获取而更新。贝叶斯更新提供了形式化的更新机制。

```python
from dataclasses import dataclass


@dataclass
class BayesianDecision:
    """
    贝叶斯决策框架。

    核心思想：决策不是一次性的，而是随着证据的积累不断更新。
    初始决策基于先验概率（经验、直觉、行业数据），
    每一个新的观测都通过贝叶斯更新修正这些概率。

    这和投资中根据新信息调整仓位是同一个逻辑：
    不是固执于初始判断，也不是每一条消息都过度反应，
    而是按照信息的质量和数量有比例地更新信念。
    """
    hypothesis: str  # 例如："LLM 在这个任务上可靠性 > 95%"
    prior: float     # 先验概率

    def update(self, evidence: str, likelihood_ratio: float) -> float:
        """
        贝叶斯更新。

        posterior = prior * likelihood_ratio / normalizing_constant

        likelihood_ratio = P(evidence | hypothesis) / P(evidence | not hypothesis)

        > 1: 证据支持假设
        = 1: 证据与假设无关
        < 1: 证据反对假设
        """
        prior_odds = self.prior / (1 - self.prior)
        posterior_odds = prior_odds * likelihood_ratio
        self.prior = posterior_odds / (1 + posterior_odds)
        return self.prior


# 示例：逐步评估 LLM 在新任务上的可靠性
assessment = BayesianDecision(
    hypothesis="LLM 在发票数据提取任务上可靠性 > 95%",
    prior=0.5,  # 初始不确定，50-50
)

observations = [
    ("10 个样本中 9 个正确", 3.0),      # 强证据支持
    ("发现一类特殊格式的发票全部提取错误", 0.3),  # 中等证据反对
    ("修改 prompt 后特殊格式也能处理", 2.0),     # 中等证据支持
    ("100 个样本的盲测准确率 96%", 5.0),         # 强证据支持
    ("上线后第一周无投诉", 1.5),                  # 弱证据支持
]

print(f"先验概率: {assessment.prior:.1%}")
for evidence, lr in observations:
    posterior = assessment.update(evidence, lr)
    print(f"观测: {evidence}")
    print(f"  似然比: {lr}, 后验概率: {posterior:.1%}")
    print()
```

贝叶斯更新的工程价值在于：它提供了一种"既不固执也不过度反应"的决策更新机制。先验概率代表初始判断，似然比代表新证据的信息量，后验概率是综合了两者的更新判断。单条弱证据不会大幅改变判断，累积的强证据会逐步移动信念。

## 形式化的局限

需要诚实面对的是：数学形式化不是万能的。

概率估计本身是主观的。上面例子中"准确率满足需求的概率是 70%"这个数字不是从某个客观来源获得的，而是工程师的主观判断。形式化能做的是让这个主观判断显式化、可讨论、可修正——但不能让它变成客观事实。

价值量化是困难的。"客户投诉"的价值损失是 -5000 还是 -50000？这取决于投诉的严重程度、客户的重要性、品牌的损害——这些因素不容易量化。形式化提供的是一个框架，让你可以在不同的假设下看决策如何变化（敏感性分析），而不是一个确定的答案。

现实比模型复杂。上面的模型假设结果之间是互斥的、概率是已知的、决策是一次性的。现实中，结果可能部分重叠，概率是不断变化的，决策是序列化的。模型的价值不在于精确预测现实，而在于提供一个比"拍脑袋"更好的思维框架。

总结而言，形式化的能力边界是清晰的：它让隐含假设显式化，让模糊权衡可量化，让主观判断可讨论、可修正。但它不提供客观答案，不消除判断的主观性，不保证模型与现实的一致性。形式化最有价值的场景是：决策涉及多个维度的权衡，团队成员对风险的直觉差异很大，或者需要向非技术利益相关者解释技术决策的逻辑。反过来，当决策的后果很小、可逆性很高时，形式化就是多余的——直接做，然后根据反馈调整。形式化的成本不应超过决策错误的成本。

最后一条尤其重要：形式化分析本身也有成本。如果决策的后果是小的、可逆的（比如 prompt 的一个措辞调整），直接做实验比建模分析更高效。数学框架应该用在高影响、低可逆性的决策上——这些决策值得投入分析成本，因为错误的代价远高于分析的代价。

这回到了本章的第一原则：Strategy 大于 Analysis。形式化分析是分析的工具，但知道什么时候分析、分析到什么程度，本身是一个战略判断。
