# 知行合一：从设计到实现的一致性

## 工程中的知行分裂

"知道正确答案"和"做到正确答案"之间的距离，比多数工程师愿意承认的要远得多。

几乎每一个有经验的工程师都知道以下原则：简单方案优于复杂方案。先验证核心假设再搭建完整系统。不要过早优化。不要为假想的需求做设计。这些原则被写在每一本软件工程教科书中，被在每一次技术分享中传播，被在每一次代码审查中引用。

然而，在实际的 LLM 应用开发中，以下情况反复出现：

团队明知应该先用 10 行 Python 验证 LLM 在目标任务上的基本表现，却花了两周搭建了一个"完整的评估框架"——然后发现 LLM 在这个任务上根本不可行，两周的工作全部废弃。

团队明知应该选择最简单的架构（一个 LLM 调用 + Pydantic 验证），却引入了一个编排框架、一个向量数据库、一个 Agent 循环——因为"万一后面需要呢"。三个月后发现 80% 的功能从未被使用，但维护成本已经不可逆地增加了。

团队明知应该为 LLM 输出设置验证层，却在时间压力下跳过了这一步——"先上线，后面再加"。上线后发现 LLM 偶尔输出的格式错误导致下游系统崩溃，修复的成本比当初加验证层高出一个数量级。

这些不是知识的缺失，是执行的偏差。知行分裂。

## 知行分裂的心理机制

知行分裂不是随机的。它有可识别的心理机制，而且这些机制在投资和工程中是同构的。

**复杂性偏好。** 人类大脑倾向于认为复杂的方案比简单的方案更"高级"、更"周全"。在投资中，这表现为偏好复杂的衍生品策略而非简单的买入持有。在工程中，这表现为偏好复杂的框架和架构而非直接的 Python 脚本。简单方案之所以不被选择，不是因为它不好，而是因为它"看起来不够高级"。

**沉没成本谬误。** 一旦在某个方向上投入了时间，团队倾向于继续投入而非止损。一个明显不工作的 prompt 策略被反复调优、一个不适合的框架被层层打补丁——因为"已经投入这么多了"。正确的做法和投资中的止损一样：当基本假设被证伪时，立刻止损，不管已经投入多少。

**从众心理。** "大家都在用 LangChain"成为技术选型的理由。"主流做法是用 RAG"成为架构决策的依据。但"大家都在做"不等于"适合你的场景"。在投资中，当所有人都在追逐同一个方向时，往往意味着最大的风险已经积累。在工程中，当所有人都在用同一个框架时，往往意味着最大的维护成本正在积累。

**恐惧驱动的过度设计。** "万一将来需要怎么办"是过度设计的标准借口。在投资中，这等价于为了防范极小概率事件而牺牲大量确定性收益。在工程中，这等价于为了应对假想的需求而增加真实的复杂度。YAGNI（You Ain't Gonna Need It）原则在 LLM 领域尤其重要——技术变化如此快速，为当前不存在的需求做的设计很可能在需求出现之前就被淘汰了。

```python
from dataclasses import dataclass
from enum import Enum


class CognitiveBias(Enum):
    COMPLEXITY_PREFERENCE = "complexity_preference"
    SUNK_COST = "sunk_cost"
    HERD_BEHAVIOR = "herd_behavior"
    FEAR_DRIVEN_OVERDESIGN = "fear_driven_overdesign"


@dataclass(frozen=True)
class KnowDoGap:
    """
    知行分裂的结构化描述。
    
    每一个实例都包含：
    - 知道应该做什么
    - 实际做了什么
    - 背后的心理机制
    - 纠正的方法
    """
    what_you_know: str
    what_you_do: str
    bias: CognitiveBias
    correction: str


COMMON_GAPS = [
    KnowDoGap(
        what_you_know="应该先用最小代码验证核心假设",
        what_you_do="花两周搭建了完整的评估和部署基础设施",
        bias=CognitiveBias.COMPLEXITY_PREFERENCE,
        correction="强制约束：第一个迭代不超过 50 行代码。"
                   "任何框架和基础设施的引入需要证明当前的痛点，"
                   "而非预防未来的痛点。",
    ),
    KnowDoGap(
        what_you_know="这个 prompt 策略已经优化了 30 个版本，效果停滞",
        what_you_do="继续优化第 31 个版本",
        bias=CognitiveBias.SUNK_COST,
        correction="预设止损规则：连续 3 个版本无显著提升（< 2%），"
                   "立即升级到架构层面的解决方案。"
                   "已经投入的时间是沉没成本，不应影响下一步决策。",
    ),
    KnowDoGap(
        what_you_know="当前的简单方案满足 90% 的需求",
        what_you_do="引入编排框架来处理剩余 10% 的边缘情况",
        bias=CognitiveBias.FEAR_DRIVEN_OVERDESIGN,
        correction="量化权衡：引入框架的维护成本 vs 手动处理 10% 边缘情况的成本。"
                   "如果后者更低，接受它。",
    ),
    KnowDoGap(
        what_you_know="应该为 LLM 输出添加验证层",
        what_you_do="跳过验证直接使用输出，因为'大部分时候是对的'",
        bias=CognitiveBias.HERD_BEHAVIOR,
        correction="把验证层视为系统的必要组件，而非可选的增强。"
                   "就像不会跳过数据库输入的参数化查询一样，"
                   "不应该跳过 LLM 输出的结构化验证。",
    ),
]
```

## 纪律性作为工程能力

知行合一需要的不是更多的知识，而是执行的纪律性。

纪律性在投资中的含义是：在情绪最强烈的时候（恐慌或狂热），依然能按照预设的策略执行。在标普回测 4800 时买入，需要的不是更多的分析，而是克服恐惧的纪律。在泡沫顶部卖出，需要的不是更多的判断，而是克服贪婪的纪律。

纪律性在工程中的含义是同一个结构：在诱惑最强烈的时候（新框架的兴奋、复杂方案的吸引、跳过验证的便利），依然能按照正确的工程原则执行。

纪律性不是天赋，是通过机制来保障的。以下是几种将纪律性嵌入工程流程的机制。

**机制一：预设决策规则。** 在做决策之前就定义好判断标准和止损条件。"如果 prompt 优化 5 轮后准确率没有达到 90%，停止优化并重新评估架构。""如果引入框架后粘合代码超过核心逻辑的 50%，移除框架。"这些规则在冷静状态下制定，在执行时不需要重新判断——只需要检查条件是否满足。

**机制二：强制性简化约束。** 第一个版本不超过 100 行代码。不引入任何框架。不使用任何异步编程。不设计任何插件系统。这些约束看起来过于严格，但它们的价值恰恰在于严格——它们强制团队聚焦于核心逻辑，排除过早引入复杂性的可能。

**机制三：定期止损审查。** 每两周对正在进行的工作做一次止损审查：这个方向的基本假设还成立吗？已经投入的成本是否影响了判断的客观性？如果今天从零开始，还会做同样的选择吗？最后一个问题是识别沉没成本谬误的最有效工具。

```python
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class EngineeringDisciplineCheckpoint:
    """
    工程纪律检查点。
    
    在关键决策节点强制执行的检查。
    不是官僚流程，是防止知行分裂的机制。
    """
    checkpoint_name: str
    created_at: datetime = field(default_factory=datetime.now)
    
    # 预设决策规则
    success_criteria: str = ""
    stop_loss_criteria: str = ""
    max_iterations: int = 5
    current_iteration: int = 0
    
    # 简化约束
    max_code_lines: Optional[int] = None
    allowed_dependencies: tuple[str, ...] = ()
    
    def check_stop_loss(self, current_metric: float, target_metric: float) -> dict:
        """
        检查是否应该止损。
        
        这个检查不需要人工判断——
        它是在决策制定时就确定好的规则的机械执行。
        """
        self.current_iteration += 1
        should_stop = self.current_iteration >= self.max_iterations
        metric_met = current_metric >= target_metric
        
        if metric_met:
            return {
                "action": "proceed",
                "reason": f"目标达成: {current_metric:.2%} >= {target_metric:.2%}",
            }
        
        if should_stop:
            return {
                "action": "stop_and_escalate",
                "reason": (
                    f"已达到最大迭代次数 {self.max_iterations}，"
                    f"当前指标 {current_metric:.2%} 未达到目标 {target_metric:.2%}。"
                    "停止当前层面的优化，升级到架构层面重新评估。"
                ),
                "sunk_cost_reminder": (
                    f"已投入 {self.current_iteration} 轮迭代。"
                    "这是沉没成本，不应影响下一步决策。"
                ),
            }
        
        return {
            "action": "continue",
            "reason": (
                f"第 {self.current_iteration}/{self.max_iterations} 轮，"
                f"当前 {current_metric:.2%}，目标 {target_metric:.2%}"
            ),
            "remaining_budget": self.max_iterations - self.current_iteration,
        }


# 使用示例：prompt 优化的纪律化管理
prompt_optimization = EngineeringDisciplineCheckpoint(
    checkpoint_name="客服意图分类 prompt 优化",
    success_criteria="分类准确率 >= 92%",
    stop_loss_criteria="5 轮优化后未达标则重新评估方案",
    max_iterations=5,
)

# 模拟 5 轮优化
accuracy_trajectory = [0.85, 0.88, 0.89, 0.895, 0.90]
for accuracy in accuracy_trajectory:
    result = prompt_optimization.check_stop_loss(accuracy, target_metric=0.92)
    print(f"轮次 {prompt_optimization.current_iteration}: "
          f"准确率 {accuracy:.1%} -> {result['action']}")
    if result["action"] == "stop_and_escalate":
        print(f"  {result['reason']}")
        print(f"  {result['sunk_cost_reminder']}")
```

## 设计与实现的结构性一致

知行合一在系统层面的表现是：设计文档描述的架构和实际代码实现的架构一致。这听起来理所当然，但在实践中，设计与实现的漂移是软件项目中最普遍的问题之一。

在 LLM 应用中，这种漂移有一些特有的形态：

**设计说"LLM 输出必须经过验证"，实现中只验证了结构没验证语义。** 设计文档要求 LLM 的输出通过 Pydantic 解析和语义检查。实现中，Pydantic 解析确实做了（因为不做就会报错），但语义检查被"临时"跳过了（"后面再加"）。系统在结构层面是健壮的，在语义层面是裸奔的。

**设计说"失败时降级到规则引擎"，实现中降级路径从未被测试。** 降级策略写在设计文档中，降级代码也确实写了，但没有人测试过当 LLM 真的失败时降级路径是否能正常工作。第一次真正需要降级时，降级代码本身就报错了。

**设计说"系统不依赖特定模型"，实现中到处是特定模型的行为假设。** 设计文档声称架构是模型无关的，但 prompt 中充满了针对特定模型调优的措辞，输出解析中充满了针对特定模型输出格式的硬编码。模型一换，到处都崩。

```python
from dataclasses import dataclass
from typing import Protocol, runtime_checkable


@runtime_checkable
class DesignContract(Protocol):
    """
    设计契约的接口。
    
    将设计文档中的承诺转化为可检查的代码接口。
    如果实现不满足接口，类型检查器会报错——
    而不是等到生产环境出问题。
    """
    
    def validate_output(self, raw_output: str) -> bool:
        """设计承诺：所有 LLM 输出经过验证。"""
        ...
    
    def degrade_gracefully(self, error: Exception) -> str:
        """设计承诺：失败时有降级方案。"""
        ...
    
    def is_model_agnostic(self) -> bool:
        """设计承诺：不依赖特定模型。"""
        ...


@dataclass
class DesignImplementationAudit:
    """
    设计-实现一致性审计。
    
    定期检查实际代码是否满足设计文档中的承诺。
    不是形式主义——是防止知行分裂的工程工具。
    """
    design_promises: list[str]
    implementation_status: dict[str, bool]
    
    @property
    def consistency_score(self) -> float:
        if not self.design_promises:
            return 1.0
        fulfilled = sum(
            1 for p in self.design_promises 
            if self.implementation_status.get(p, False)
        )
        return fulfilled / len(self.design_promises)
    
    @property
    def gaps(self) -> list[str]:
        return [
            p for p in self.design_promises
            if not self.implementation_status.get(p, False)
        ]
    
    def report(self) -> str:
        lines = [f"设计-实现一致性: {self.consistency_score:.0%}"]
        if self.gaps:
            lines.append("未兑现的设计承诺:")
            for gap in self.gaps:
                lines.append(f"  - {gap}")
        return "\n".join(lines)


# 审计示例
audit = DesignImplementationAudit(
    design_promises=[
        "LLM 输出经过 Pydantic 结构验证",
        "LLM 输出经过语义一致性检查",
        "失败时降级到规则引擎",
        "降级路径有独立的测试覆盖",
        "系统不硬编码特定模型的行为假设",
    ],
    implementation_status={
        "LLM 输出经过 Pydantic 结构验证": True,
        "LLM 输出经过语义一致性检查": False,
        "失败时降级到规则引擎": True,
        "降级路径有独立的测试覆盖": False,
        "系统不硬编码特定模型的行为假设": False,
    },
)

print(audit.report())
# 设计-实现一致性: 40%
# 未兑现的设计承诺:
#   - LLM 输出经过语义一致性检查
#   - 降级路径有独立的测试覆盖
#   - 系统不硬编码特定模型的行为假设
```

40% 的一致性分数意味着系统的实际可靠性远低于设计文档暗示的水平。这种漂移不会在功能测试中被发现——功能在正常情况下能工作。它会在异常情况下暴露——而异常情况恰恰是可靠性设计要覆盖的场景。

## 最小可行纪律

知行合一不需要一步到位。以下是一组最小可行的纪律实践，成本极低但防御力可观。

**纪律一：每个 LLM 调用都有输出类型定义。** 不是事后加的，是调用之前就定义好的。用 Pydantic 模型声明期望的输出结构。这一个步骤同时解决了三个问题：prompt 变得更精确（类型定义本身就是规格说明）、输出有了自动验证、设计意图被代码化了（不是写在注释里的愿望，而是可执行的约束）。

**纪律二：每个降级路径都有测试。** 如果设计文档说"LLM 失败时降级到 X"，那么测试套件中必须有一个测试模拟 LLM 失败并验证降级到 X 正常工作。降级路径的测试不是锦上添花——一个从未被测试过的降级路径比没有降级路径更危险，因为它给了你虚假的安全感。

**纪律三：决策记录伴随代码。** 每一个重要的技术决策（选这个模型而非那个、选这个架构而非那个、选这个框架而非那个）都在代码仓库中留下一条简短的记录：做了什么决策、为什么、评估了哪些替代方案、在什么条件下应该重新评估。这不是文档主义——这是防止三个月后忘记当初为什么这么决策、然后重蹈覆辙的最低成本手段。

```python
"""
决策记录示例。

放在项目根目录的 decisions/ 文件夹中，
或者直接作为代码注释。

格式不重要，重要的是存在。
"""

DECISION_RECORD = {
    "id": "DR-001",
    "date": "2024-12-15",
    "title": "客服意图分类使用 LLM 而非传统 NLP",
    "context": (
        "需要将客服邮件分类到 12 个意图类别。"
        "传统 NLP（TF-IDF + SVM）在 500 条标注数据上准确率 78%。"
        "GPT-4o 在 zero-shot 下准确率 89%。"
    ),
    "decision": "使用 LLM，辅以 Pydantic 输出验证和规则引擎降级",
    "alternatives_considered": [
        "传统 NLP：准确率不够，扩展新类别需要重新标注和训练",
        "纯 LLM 无降级：可靠性无保障",
        "纯规则引擎：覆盖率不足，维护成本高",
    ],
    "revisit_conditions": [
        "LLM 调用成本超过每月 500 美元",
        "分类准确率低于 85% 持续一周",
        "模型提供商 API 不稳定影响 SLA",
    ],
}
```

知行合一不是一个道德要求，是一个工程能力。它可以通过机制来保障、通过实践来训练、通过审计来验证。在一个核心组件是概率性的系统中，工程纪律的价值不是降低了，而是提高了——因为概率性系统的失败模式更隐蔽、更难调试、更容易被"大部分时候能工作"的假象掩盖。
