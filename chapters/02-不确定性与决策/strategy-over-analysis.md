# Strategy 大于 Analysis：工程决策的第一原则

## 分析的陷阱

LLM 应用开发中最常见的失败模式不是技术实现的失败，而是决策层面的失败。具体来说，是把有限的时间和注意力花在了错误的层面上。

一个团队花三周时间对比了五个大模型在某个 benchmark 上的表现差异，最终选择了分数最高的那个。然后花两周时间微调 prompt，把准确率从 87% 提升到 91%。然后花一周时间集成了一个编排框架。六周后系统上线，发现核心问题是：这个任务根本不应该用 LLM 来做——用一个正则表达式加规则引擎就能解决，准确率 100%，延迟低两个数量级，成本低三个数量级。

这不是虚构的案例，而是一种结构性的思维偏差：当手里有了锤子，看什么都像钉子。当团队掌握了 LLM 的使用方法，就倾向于用 LLM 解决所有问题，然后在 LLM 的框架内做无穷无尽的优化。这些优化在战术层面是正确的，但在战略层面是错误的——方向错了，走得越远偏得越多。

## Strategy 大于 Analysis 的精确含义

Strategy 大于 Analysis 不是反智主义，不是鼓励拍脑袋决策。它的精确含义是：在资源（时间、注意力、成本）有限的条件下，战略层面的正确性对系统成败的影响权重远大于战术层面的精细度。

用数学语言表述：设系统的成功概率为 P(S)，战略决策为 D_s，战术执行为 D_t，则：

P(S | D_s 正确, D_t 一般) >> P(S | D_s 错误, D_t 优秀)

这个不等式在投资领域有同样的结构。2022 年英伟达股价跌至 100 美元附近时，战略判断是"AI 基础设施的长期需求被严重低估"。这个判断一旦正确，买入时点偏差 10%、仓位管理粗糙 20%，都不影响最终的丰厚回报。反过来，如果战略判断错误——比如认为 AI 是泡沫——那么再精湛的止损策略和仓位管理都是在优化一个注定亏损的头寸。

在 LLM 工程中，战略决策包括但不限于：

- 这个任务是否应该用 LLM？
- 如果用 LLM，它在系统中的角色是什么——核心引擎还是辅助组件？
- 不确定性的容忍边界在哪里？系统能承受多高的失败率？
- 是追求单次调用的高精度，还是通过架构设计来容忍单次调用的低精度？

战术决策包括但不限于：

- 用 GPT-4o 还是 Claude 3.5？
- temperature 设多少？
- prompt 的措辞怎么优化？
- 用哪个编排框架？

战术决策不是不重要，但它们的重要性以战略决策正确为前提。在战略决策错误的框架下优化战术，是一种高效率的浪费。

## LLM 应用的战略决策框架

把战略决策从模糊的直觉转化为可操作的分析框架，需要回答三个层级的问题。

**第一层：任务适配性判断。** 这个任务是否在 LLM 的能力边界之内？[第一章](../01-认识论/what-llms-cannot-do.md)已经划定了边界：精确计算、状态维护、一致性保障、实时数据处理——这些不在边界内。意图解析、自然语言生成、文本转换、模式识别——这些在边界内。判断一个任务的适配性，不是看 LLM "能不能做"（它几乎什么都能尝试），而是看 LLM 做这件事是否比替代方案有结构性优势。

**第二层：不确定性容忍度评估。** 假设任务适合 LLM，下一个问题是：系统能承受多大的不确定性？一个内部工具的文本摘要功能，偶尔输出质量不佳是可以接受的——用户可以刷新重试。一个面向客户的合同生成系统，任何错误都可能导致法律后果。不确定性容忍度决定了系统需要多厚的验证层、多高的冗余度、以及多严格的人工审核流程。

**第三层：架构定位决策。** LLM 在系统中扮演什么角色？这个决策直接影响系统的可靠性上限。如果 LLM 是核心引擎——系统的主要功能由 LLM 直接实现——那么系统的可靠性上限就是 LLM 的可靠性。如果 LLM 是辅助组件——核心逻辑由确定性代码实现，LLM 负责自然语言理解和生成——那么系统的可靠性可以远高于 LLM 本身。

```python
from dataclasses import dataclass
from typing import Literal
from enum import Enum


class TaskFitLevel(Enum):
    """任务与 LLM 的适配程度。"""
    STRONG_FIT = "strong_fit"        # LLM 有结构性优势
    MODERATE_FIT = "moderate_fit"    # LLM 可用，但替代方案也可行
    WEAK_FIT = "weak_fit"            # LLM 可以做，但不是最佳选择
    MISFIT = "misfit"                # 不应该用 LLM


class UncertaintyTolerance(Enum):
    """系统对不确定性的容忍程度。"""
    HIGH = "high"        # 偶尔出错可接受（内部工具、创意辅助）
    MEDIUM = "medium"    # 可接受低频错误，但需要检测和恢复
    LOW = "low"          # 错误代价高昂（客户交互、财务文档）
    ZERO = "zero"        # 不允许错误（医疗、法律的关键判断）


class LLMRole(Enum):
    """LLM 在系统中的角色定位。"""
    CORE_ENGINE = "core_engine"          # 核心功能由 LLM 直接实现
    SMART_INTERFACE = "smart_interface"  # LLM 处理输入输出，核心逻辑确定性
    AUXILIARY = "auxiliary"              # LLM 处理辅助任务（摘要、分类等）


@dataclass(frozen=True)
class StrategicAssessment:
    """
    对一个 LLM 应用项目的战略评估。
    
    这个评估应该在写第一行代码之前完成。
    它的价值不在于精确量化（这里的分类是粗粒度的），
    而在于迫使团队在正确的层面上思考问题。
    """
    task_description: str
    fit_level: TaskFitLevel
    uncertainty_tolerance: UncertaintyTolerance
    llm_role: LLMRole
    alternative_approaches: tuple[str, ...]
    strategic_risk: str
    
    def should_proceed_with_llm(self) -> bool:
        """
        是否应该使用 LLM 的粗粒度判断。
        
        注意：这不是一个精确的决策函数，
        而是一个迫使决策者面对关键问题的检查清单。
        """
        if self.fit_level == TaskFitLevel.MISFIT:
            return False
        if (self.uncertainty_tolerance == UncertaintyTolerance.ZERO 
            and self.llm_role == LLMRole.CORE_ENGINE):
            return False  # 零容忍 + LLM 为核心引擎 = 结构性矛盾
        return True


# 示例：两个项目的战略评估对比

email_classifier = StrategicAssessment(
    task_description="将客服邮件自动分类到 5 个类别",
    fit_level=TaskFitLevel.STRONG_FIT,
    uncertainty_tolerance=UncertaintyTolerance.MEDIUM,
    llm_role=LLMRole.CORE_ENGINE,
    alternative_approaches=(
        "传统 NLP 分类器（TF-IDF + SVM）",
        "关键词规则引擎",
    ),
    strategic_risk="分类错误导致工单分配失败，但可通过人工纠正",
)

invoice_calculator = StrategicAssessment(
    task_description="从发票图片中提取金额并计算总价",
    fit_level=TaskFitLevel.MODERATE_FIT,  # 提取适合 LLM，计算不适合
    uncertainty_tolerance=UncertaintyTolerance.LOW,
    llm_role=LLMRole.SMART_INTERFACE,  # LLM 负责提取，确定性代码负责计算
    alternative_approaches=(
        "OCR + 规则解析 + 确定性计算",
        "LLM 提取结构化数据 + 确定性计算",
    ),
    strategic_risk="金额提取错误直接影响财务准确性",
)

print(f"邮件分类器: 应使用 LLM = {email_classifier.should_proceed_with_llm()}")
print(f"发票计算器: 应使用 LLM = {invoice_calculator.should_proceed_with_llm()}")
```

## 战术陷阱的典型形态

识别战术陷阱和识别战略机会同样重要。以下是 LLM 应用开发中最常见的战术陷阱。

**Benchmark 崇拜。** 花大量时间对比不同模型在标准 benchmark 上的得分。问题在于：benchmark 衡量的是模型的一般能力，而你的任务是特定的。模型 A 在 MMLU 上比模型 B 高 3 分，不意味着它在你的发票分类任务上更好。唯一有意义的评估是在你的真实数据上的表现——但这需要先有战略层面的正确方向，才值得投入这个评估成本。

**Prompt 炼金术。** 反复调整 prompt 的措辞，试图找到"完美"的表述。这个过程经常缺少收敛判据：什么时候停止？"准确率提升到什么程度就够了"这个问题如果没有在战略层面预先定义，prompt 优化就会变成一个无终止的循环。更深层的问题是：如果一个任务需要极其精心的 prompt 才能勉强工作，这本身就是一个信号——也许这个任务不适合用 prompt 来解决，也许需要的是更好的架构设计而非更好的 prompt。

**框架选型过度投入。** 在 LangChain、LlamaIndex、CrewAI 等框架之间反复比较。框架解决的是战术问题（如何组织代码、如何管理链路），不解决战略问题（应不应该这么做、做到什么程度）。而且框架锁定的风险被系统性低估了——一旦深度集成了某个框架，迁移成本可能比重写还高。

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class TacticalTrap:
    """战术陷阱的结构化描述。"""
    name: str
    symptom: str
    root_cause: str
    strategic_alternative: str


COMMON_TRAPS = [
    TacticalTrap(
        name="Benchmark 崇拜",
        symptom="团队花两周对比模型 benchmark，但没花两小时讨论任务是否适合 LLM",
        root_cause="把模型选择（战术）当成了最重要的决策，忽略了任务适配性（战略）",
        strategic_alternative="先在 10 条真实数据上用任意一个模型做原型验证，"
                              "确认任务可行后再考虑模型选择",
    ),
    TacticalTrap(
        name="Prompt 炼金术",
        symptom="prompt 文件已经迭代了 47 个版本，准确率在 88%-92% 之间反复震荡",
        root_cause="没有收敛判据，不知道什么时候该停止优化 prompt、"
                    "转而改进架构或重新评估任务设计",
        strategic_alternative="预先定义质量阈值和最大优化轮次，"
                              "达不到阈值时升级到架构层面的方案",
    ),
    TacticalTrap(
        name="框架选型瘫痪",
        symptom="评估了 5 个编排框架，做了对比矩阵，写了技术选型文档，"
                "三周过去了还没写业务代码",
        root_cause="框架解决的是代码组织问题，不是核心的业务和架构问题。"
                    "在业务逻辑不清晰时选框架，是在没有地图的情况下选交通工具",
        strategic_alternative="先用纯 Python 实现核心逻辑的原型，"
                              "确认架构方向后再考虑是否需要框架",
    ),
]
```

## 投资决策与工程决策的结构性同构

Strategy 大于 Analysis 这个原则不是从软件工程中提炼出来的——它是从投资实战中提炼出来的，然后发现在工程领域有精确的对应。

投资决策的结构是：在信息永远不完备的条件下，做出有时间约束的资源分配决定。工程决策的结构是同一个：在需求不完全明确、技术不完全成熟、资源不完全充裕的条件下，做出有交付期限的技术选择。

这个同构不是表面类比，而是可以映射到具体操作层面的：

| 投资决策 | 工程决策 | 共同结构 |
|---------|---------|---------|
| 选行业/赛道 | 选技术路线/是否用 LLM | 战略层：方向选择 |
| 选个股 | 选模型/选框架 | 战术层：标的选择 |
| 买入时机和仓位 | 开发节奏和资源分配 | 执行层：时机与力度 |
| 止损纪律 | 技术方案的退出标准 | 风控层：止损机制 |
| 长期持有 vs 短线交易 | 长期架构 vs 快速原型 | 时间框架选择 |

关键洞察是：在两个领域中，战略层面的决策失误都无法被战术层面的优化弥补。买了错误行业的股票，无论怎么优化买入价格都不会盈利。选了错误的技术路线，无论怎么优化 prompt 都不会成功。

```python
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class DecisionLayer:
    """
    决策层级模型。
    
    投资和工程共享同一个层级结构：
    战略 -> 战术 -> 执行 -> 风控。
    每一层的正确性以上一层的正确性为前提。
    """
    level: str           # "strategic", "tactical", "execution", "risk_control"
    decision: str
    reversibility: str   # "irreversible", "costly", "cheap"
    impact_scope: str    # "system-wide", "component", "local"
    time_to_feedback: str  # 做出决策后多久能知道对错
    
    @property
    def decision_cost(self) -> str:
        """决策错误的代价与层级正相关。"""
        costs = {
            "strategic": "方向性错误，可能需要推翻重来",
            "tactical": "需要重构部分系统，成本中等",
            "execution": "局部修改，成本较低",
            "risk_control": "取决于触发时机，可能从低到高",
        }
        return costs.get(self.level, "未知")


# LLM 应用开发的决策层级示例
strategic = DecisionLayer(
    level="strategic",
    decision="客服系统的意图分类使用 LLM 而非传统 NLP",
    reversibility="costly",
    impact_scope="system-wide",
    time_to_feedback="数周到数月（需要上线后看真实效果）",
)

tactical = DecisionLayer(
    level="tactical",
    decision="使用 Claude 3.5 而非 GPT-4o",
    reversibility="cheap",
    impact_scope="component",
    time_to_feedback="数天（切换模型后对比评估）",
)

execution = DecisionLayer(
    level="execution",
    decision="prompt 中使用 few-shot 示例而非 zero-shot",
    reversibility="cheap",
    impact_scope="local",
    time_to_feedback="数小时（修改后立即测试）",
)

for layer in [strategic, tactical, execution]:
    print(f"[{layer.level}] {layer.decision}")
    print(f"  可逆性: {layer.reversibility}, 错误代价: {layer.decision_cost}")
    print()
```

## 战略思维的操作化

Strategy 大于 Analysis 不是一个只在白板前讨论的原则，它可以被操作化为具体的实践。

**实践一：任何 LLM 项目的第一个产出物不应该是代码，而是战略评估文档。** 这个文档回答三个问题：为什么用 LLM（而不是替代方案）？LLM 在系统中的角色是什么？不确定性的容忍边界在哪里？这个文档不需要长——一页纸就够——但它迫使团队在正确的层面上做出决策。

**实践二：设立明确的收敛判据。** 在开始 prompt 优化或模型对比之前，预先定义"什么结果意味着方向正确，什么结果意味着需要战略调整"。没有收敛判据的优化是没有终止条件的循环——它会消耗所有可用时间而不产生结论。

**实践三：原型验证先于系统建设。** 用最少的代码（通常是几十行 Python）验证核心假设：LLM 在这个任务上的表现是否在可接受范围内？然后再决定是否投入更多资源。这和投资中"小仓位试探"的逻辑相同——用最小的成本获取最关键的信息。

```python
def strategic_prototype(
    task_description: str,
    test_cases: list[dict],
    quality_threshold: float,
    max_investment_hours: int = 4,
) -> dict:
    """
    战略原型验证的框架。
    
    目的不是构建可部署的系统，
    而是以最小成本验证核心假设：
    LLM 在这个任务上是否可行。
    
    这是 Strategy > Analysis 的操作化：
    4 小时的原型验证比 4 周的框架选型更有战略价值。
    """
    results = {
        "task": task_description,
        "n_test_cases": len(test_cases),
        "quality_threshold": quality_threshold,
        "max_hours": max_investment_hours,
        "verdict": None,
        "recommendation": None,
    }
    
    # 在实际实现中，这里会：
    # 1. 用最简单的 prompt 调用 LLM 处理每个测试用例
    # 2. 用预定义的质量指标评估每个输出
    # 3. 计算通过率
    
    # 伪逻辑（实际应替换为真实 LLM 调用）
    pass_rate = 0.0  # 占位，实际由评估结果填充
    
    if pass_rate >= quality_threshold:
        results["verdict"] = "proceed"
        results["recommendation"] = (
            "核心假设验证通过。可以投入资源进行系统设计。"
            "下一步：定义架构、评估模型选项、设计验证流程。"
        )
    elif pass_rate >= quality_threshold * 0.7:
        results["verdict"] = "investigate"
        results["recommendation"] = (
            "核心假设部分成立。需要分析失败案例的模式。"
            "可能通过更好的 prompt 设计或架构调整来改善，"
            "也可能需要混合架构（LLM + 规则引擎）。"
        )
    else:
        results["verdict"] = "pivot"
        results["recommendation"] = (
            "核心假设不成立。LLM 在当前形态下不适合这个任务。"
            "战略选项：换用传统方案、降低任务复杂度、或等待更强的模型。"
            "不要在 prompt 优化上继续投入——这是战术层面的挣扎。"
        )
    
    return results
```

## 与本章其他文章的关系

Strategy 大于 Analysis 是本章的第一原则，后续四篇文章是这个原则在不同维度上的展开：

- [不确定性不是敌人，是约束条件](uncertainty-as-constraint.md)——在战略层面接受不确定性后，如何在架构层面管理它。
- [恐慌时刻的逆向工程](contrarian-engineering.md)——当技术环境剧变时，如何保持战略定力。
- [知行合一](design-implementation-consistency.md)——好的战略判断如何落地为一致的实现。
- [决策的数学结构](decision-mathematics.md)——将工程决策形式化为可计算的优化问题。
