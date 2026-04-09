# Schema as Workflow

## 字段顺序就是推理顺序

[第一章](../01-认识论/01-一次一个token.md)讨论了自回归生成的本质：LLM 按顺序生成 token，每个 token 的生成以所有已生成的 token 为条件。当 LLM 以 structured output 模式填充一个 Pydantic 模型时，它按字段定义顺序依次生成内容。后面的字段能"看到"前面所有字段的值。

这个机制上的限制意味着：Schema 的字段排列不只是数据结构的组织方式，它同时定义了 LLM 的推理路径。

```python
from pydantic import BaseModel, Field

class DocumentAnalysis(BaseModel):
    """分析一篇文档的核心论点和论证结构。"""

    main_topic: str = Field(
        description="文档讨论的核心主题，用一句话概括"
    )
    key_claims: list[str] = Field(
        description="文档中提出的关键主张，按重要性降序排列"
    )
    evidence_quality: str = Field(
        description="基于上述 key_claims，评估论证证据的质量：strong、moderate 或 weak"
    )
    conclusion: str = Field(
        description="综合 main_topic、key_claims 和 evidence_quality，"
                    "给出对这篇文档的整体评价"
    )
```

LLM 处理这个模型时：先识别主题，再提取主张，然后评估证据质量，最后给出结论。`conclusion` 的生成建立在前三个字段的基础上——它能参考已经生成的主题判断、主张列表和证据评估。

字段排列隐式地定义了 Chain-of-Thought 的步骤——这就是 Schema as Workflow。传统 CoT 通过自然语言指令引导推理（"先想一想...然后分析..."），声明式 CoT 通过结构定义引导推理。前者依赖 LLM 对自然语言指令的理解，后者通过输出格式的硬限制来确定推理的顺序和分步。

但结构约束的是推理的**顺序和分步**，不是推理的**质量**。LLM 完全可以按字段顺序生成但在某个字段内敷衍了事。声明式 CoT 保证了"先做 A 再做 B"的执行顺序，但"A 做得好不好"仍然取决于 Field description 的质量和模型本身的能力。

## 每个字段一个任务

Schema as Workflow 有一个前提条件：每个字段承担且仅承担一个推理步骤。如果一个字段的 description 里塞了多个任务，字段顺序定义推理路径这件事就失效了——一个步骤里混杂了多个推理任务，LLM 在这个字段内部没有结构化引导。

```python
from pydantic import BaseModel, Field
from typing import Literal


# 反例：一个字段承担了三个任务
class BadAnalysis(BaseModel):
    result: str = Field(
        description="分析文本的情感倾向，提取其中提到的产品名称，"
                    "并给出处理优先级判断"
    )
```

这个 `result` 字段要求 LLM 同时做三件事：情感分析、实体提取、优先级判断。三个任务有不同的失败模式和质量标准，但被压缩进一个字符串字段中，无法独立评估、独立优化。更重要的是，三个任务之间可能存在依赖关系（优先级判断应该基于情感分析的结果），但这个依赖在单一字段内部无法被结构化地表达。

```python
# 正例：每个字段一个推理步骤
class GoodAnalysis(BaseModel):
    sentiment: Literal["positive", "negative", "neutral"] = Field(
        description="文本的情感倾向"
    )
    products: list[str] = Field(
        description="文本中提及的产品名称"
    )
    priority: Literal["high", "medium", "low"] = Field(
        description="基于上述 sentiment 判断的处理优先级"
    )
```

三个字段，三个推理步骤。每个字段有独立的类型约束（`Literal` 枚举、`list[str]`），可以独立验证。`priority` 的 description 显式引用了 `sentiment`，声明了推理步骤间的依赖关系。

这个原则是软件工程中单一职责原则在 field 级别的应用：每个字段做一件事，只有一个变化的原因。违反它的后果和代码中违反 SRP 的后果相同——修改一个功能可能意外影响另一个功能，无法独立测试，无法独立优化。

## 显式依赖声明

字段之间的依赖关系需要在 description 中显式声明。LLM 在生成后续字段时虽然能"看到"前面字段的值，但不意味着它会主动利用这些值——除非 description 明确告诉它这么做。

```python
from pydantic import BaseModel, Field
from typing import Optional


# 隐式依赖：LLM 可能独立生成 recommendation，忽略 analysis 的内容
class ImplicitDependency(BaseModel):
    analysis: str = Field(description="分析文本内容")
    recommendation: str = Field(description="给出建议")


# 显式依赖：recommendation 明确声明基于 analysis 的结论
class ExplicitDependency(BaseModel):
    analysis: str = Field(description="分析文本内容")
    recommendation: str = Field(
        description="基于上述 analysis 的结论，给出具体的改进建议"
    )
```

简单结构里这个差异不明显。但字段一多，隐式依赖就会导致不可预测的行为。一个有 10 个字段的模型，如果字段之间的依赖关系没有在 description 中显式声明，LLM 可能以任意方式处理字段之间的关系——有时碰巧正确，有时完全偏离预期。

显式依赖声明的格式是直接的：在后续字段的 description 中引用前面字段的名称，说明它们之间的关系。"基于上述 X"、"综合 X 和 Y"、"在 X 的基础上"——这些描述建立了推理步骤之间的逻辑连接。

## 组合与嵌套

当推理步骤本身需要结构化的子步骤时，通过类型嵌套来表达。

```python
from pydantic import BaseModel, Field
from typing import Literal


class SentimentAnalysis(BaseModel):
    """情感分析：独立的推理单元。"""
    sentiment: Literal["positive", "negative", "neutral"]
    confidence: float = Field(ge=0.0, le=1.0)


class ProductExtraction(BaseModel):
    """产品提取：独立的推理单元。"""
    products: list[str] = Field(
        description="文本中提及的产品名称"
    )


class CustomerEmailAnalysis(BaseModel):
    """客户邮件分析的完整工作流。"""
    sentiment: SentimentAnalysis = Field(
        description="对邮件进行情感分析"
    )
    products: ProductExtraction = Field(
        description="从邮件中提取产品信息"
    )
    priority: Literal["high", "medium", "low"] = Field(
        description="基于上述 sentiment 的结果判断处理优先级"
    )
    reply: str = Field(
        description="综合 sentiment、products 和 priority 的分析结果，"
                    "生成恰当的客户回复"
    )
```

`SentimentAnalysis` 和 `ProductExtraction` 是独立的推理单元，可以在其他任务中复用。`CustomerEmailAnalysis` 通过嵌套它们构建完整的工作流，同时用顶层字段的排列定义了工作流的步骤顺序。

注意 `reply` 字段的 description 引用了前面所有三个字段——这是依赖关系的显式声明。组合通过类型嵌套和字段引用来建立结构化的关系，而非把四段 prompt 拼接在一起。

这种模式和软件工程中模块化设计的原则一致——高内聚、低耦合，通过接口（类型定义）而非实现（自然语言描述）来组合。每个子模型可以独立测试、独立演进，组合后的模型通过字段排列定义了它们协同工作的顺序。

## 字段排列的设计原则

字段排列不是随意的，它需要遵循自然的推理流程。三个指导原则：

**先观察，后判断，最后结论。** 数据提取类字段（事实性的、可验证的）放在前面，分析判断类字段（需要推理的、有不确定性的）放在中间，综合结论类字段放在最后。这与人类的分析思维顺序一致，也为后续字段提供了最丰富的上下文。

**依赖在前，被依赖在后。** 如果字段 B 的 description 引用了字段 A，A 必须在 B 之前定义。这样 A 的值在 B 生成时已经存在，B 的推理可以真实地建立在 A 的结果之上。

**同类字段相邻。** 多个数据提取字段应该排在一起，多个判断字段应该排在一起。这减少了 LLM 在不同类型的认知任务之间频繁切换的负担。

```python
from pydantic import BaseModel, Field
from typing import Literal, Optional


class InvestmentReport(BaseModel):
    # 第一层：数据提取（事实性，可验证）
    company_name: str = Field(description="报告涉及的公司名称")
    ticker: Optional[str] = Field(
        default=None,
        description="股票代码（如有）"
    )
    revenue_millions: Optional[float] = Field(
        default=None, gt=0,
        description="营收（百万美元），原文未提及则为 null"
    )

    # 第二层：分析判断（需要推理，有不确定性）
    market_position: Literal["leader", "challenger", "niche", "unclear"] = Field(
        description="基于报告内容判断的市场地位"
    )
    risk_factors: list[str] = Field(
        min_length=0, max_length=5,
        description="报告中提及的主要风险因素"
    )

    # 第三层：综合结论
    summary: str = Field(
        max_length=500,
        description="综合以上 company_name、revenue_millions、"
                    "market_position 和 risk_factors，"
                    "给出投资视角的简要总结"
    )
```

三层递进：先提取公司名称和财务数据（可以用事实核查来验证），再做定性判断（统计性的"正确性"），最后综合前面所有信息给出结论。每一层的质量标准不同，分层排列使得为不同层设定不同的验证策略成为可能。

## Schema as Workflow 的边界

Schema as Workflow 和 Code as Prompt 一样有适用边界。

**线性推理的局限。** 字段排列定义的是线性的推理路径：A → B → C → D。当推理需要迭代（基于 C 的结果回头修正 A）或分支（根据 B 的值走不同的推理路径）时，单个模型的字段排列无法表达。这类复杂推理需要在编排层面处理——用代码逻辑控制多次 LLM 调用之间的流程，[第五章](../05-架构与编排/00-概述.md)讨论这个话题。

**字段数量的认知负荷。** 字段越多，LLM 需要在生成后续字段时参考的上下文越长。实践中，一个模型的顶层字段不宜超过 7-8 个。超过这个数量，考虑通过嵌套将相关字段分组——每个嵌套模型成为一个内聚的推理子单元。

**确定性的边界。** 即使字段排列完美地反映了推理逻辑，LLM 的输出仍然是概率性的。同一个模型的多次调用可能产生不同的推理路径和结论。Schema as Workflow 提高了推理的结构化程度和可预测性，但不消除概率性——这是 LLM 应用的基本约束，不是 Schema 设计能解决的问题。
