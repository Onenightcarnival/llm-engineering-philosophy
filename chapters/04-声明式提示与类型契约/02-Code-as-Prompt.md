# Code as Prompt

## 代码就是提示

传统的 LLM 应用开发模式中，prompt 和代码是两样独立的东西。prompt 是一段自然语言文本，代码是处理 LLM 输入输出的程序逻辑。两者靠字符串拼接联系在一起——代码负责把 prompt 拼好发给 LLM，再把 LLM 的文本输出解析回程序能处理的数据结构。

问题就在于 prompt 和代码是分开的：prompt 里说的和代码里期望的可能不一致。prompt 说"返回一个 JSON，包含 sentiment 字段"，但代码里解析的数据结构可能期望 `emotion` 字段。这类不一致在运行时才暴露，开发时发现不了。

Code as Prompt 的核心主张是消除这个分离：用 Pydantic BaseModel 同时充当类型定义、语义指令和输出验证器。代码本身就是 prompt，不再需要一段独立的自然语言文本来描述输出格式。

## 三层语义

一个 Pydantic 模型作为 prompt 规格说明时，同时在三个层面发挥作用。

**类型注解是约束层。** `name: str`、`score: float`、`tags: list[str]` ——这些类型注解定义了 LLM 输出的结构约束。当 LLM 的输出被解析为 Pydantic 模型时，任何违反类型约束的值都会被拒绝。虽然要到运行时才会拒绝不合规的值，但约束在开发阶段就写好了——代码审查、静态分析和版本控制都管得到。

**Field description 是语义层。** 这是 Pydantic 模型区别于普通数据类的关键特性。

```python
from pydantic import BaseModel, Field

class SentimentAnalysis(BaseModel):
    sentiment: str = Field(
        description="文本的情感倾向，必须是 positive、negative 或 neutral 之一"
    )
    confidence: float = Field(
        description="情感判断的置信度，0.0 到 1.0 之间",
        ge=0.0, le=1.0
    )
    reasoning: str = Field(
        description="得出该情感判断的推理过程，需要引用原文中的具体证据"
    )
```

每个 Field 的 description 就是传递给 LLM 的语义指令。它告诉 LLM 这个字段"应该是什么"——靠的是和类型注解绑在一起的精确说明，不是自然语言段落里的模糊描述。语义说明和结构约束定义在同一个地方，不可能出现"描述说返回一个数字，但类型写了 str"这种不一致。

**Validator 是不变量层。** `ge=0.0, le=1.0` 定义了值域约束，自定义的 `field_validator` 和 `model_validator` 定义了更复杂的不变量——字段之间的一致性、业务规则、格式的精确匹配。

三层结构的组合效果是：一个 Pydantic 模型同时充当了类型定义、prompt 指令和输出验证器。一处定义，三处生效。

## 为什么是 Pydantic

Python 里做数据定义的工具很多：dataclass、TypedDict、attrs、marshmallow。选 Pydantic 是工程权衡的结果，不是唯一解。

**dataclass 缺少运行时验证。** dataclass 能写类型注解，但它不做运行时校验。LLM 的输出本质上不可信。没有运行时验证，就等于把防线交给了下游代码。

**TypedDict 是纯结构性的。** TypedDict 定义了字典的键类型，但没有 description、没有 validator、没有序列化逻辑。它是类型检查器的工具，不是运行时的工具。

**Pydantic 三件事都能做：** 类型检查（通过注解）、语义传递（通过 Field description）、运行时验证（通过 validator）。而且 Pydantic v2 原生支持 JSON Schema 导出——`model.model_json_schema()` 直接生成符合 JSON Schema 规范的结构描述，这正是主流 LLM API（OpenAI、Anthropic）所接受的 structured output 格式。

## 从 Pydantic 到 JSON Schema 的投影

Pydantic 模型和 JSON Schema 之间有精确的映射。`model_json_schema()` 将 Pydantic 模型投影为 JSON Schema，这个投影是有损的。

```python
from pydantic import BaseModel, Field
from typing import Literal

class ReviewAnalysis(BaseModel):
    sentiment: Literal["positive", "negative", "neutral"] = Field(
        description="评论的情感倾向"
    )
    score: float = Field(
        description="情感强度评分",
        ge=0.0, le=1.0
    )
    key_phrases: list[str] = Field(
        description="支持情感判断的关键短语",
        min_length=1, max_length=5
    )
```

`model_json_schema()` 生成的 JSON Schema 包含了 `enum`（来自 Literal）、`minimum`/`maximum`（来自 ge/le）、`minItems`/`maxItems`（来自 min_length/max_length）。这些约束在 Schema 层面可以被 LLM 的 structured output 机制在生成时强制执行。

但 Pydantic 的 `field_validator` 和 `model_validator` 不会出现在 JSON Schema 中——它们是 Python 运行时的逻辑，无法序列化为 Schema 约束。这就是 JSON Schema 表达能力的上限：上限之内的约束在 LLM 生成时就能强制执行，上限之外的约束在解析输出时由 Pydantic 运行时验证执行。两层防线各司其职。

## Schema 是契约，不只是格式要求

多数开发者把 JSON Schema 当作"输出格式要求"——告诉 LLM "请返回这个格式的 JSON"。但 Schema 不止能做这个。

格式要求是单方面的：它只约束输出的语法结构。契约是双向的：它同时约束输出的结构和语义，调用者也隐含着承诺——"我会按照这个 Schema 来解析你的输出，如果你的输出符合 Schema，我保证能正确处理它"。

把 Schema 当契约来设计，思路不一样。只当格式要求，就会往里面塞尽可能多的约束，试图用格式弥补语义的模糊。当契约来设计，就会清晰地区分三类约束：

1. **结构约束**（字段名、类型、嵌套关系）——Schema 的核心职责，可被机器严格验证。
2. **值域约束**（枚举值、数值范围、字符串模式）——Schema 可以表达，可被机器验证。
3. **语义约束**（字段的含义、字段之间的业务关系）——由 description 承载，本质上依赖 LLM 的"理解"，只能被弱验证。

Schema 验证通过只意味着输出的格式和值域正确，不意味着语义正确。

## 适用边界

Code as Prompt 有明确的适用范围。

**创意性任务的过度约束。** 当任务需要开放式输出（文学创作、头脑风暴、自由形式的对话）时，强制 structured output 会抑制 LLM 的表现。类型系统擅长约束，但约束不总是好事——问题本身就是模糊的，过度精确的约束会排除正确答案。

**模型能力的依赖。** 嵌套层级过深、字段数量过多、约束条件过于复杂——都会让 LLM 更难生成合格的输出。Pydantic 模型的复杂度不应超出目标模型的能力范围。

**Description 的质量仍然是手艺。** Pydantic 提供了结构化的框架，但每个 Field 的 description 仍然是自然语言，仍然依赖编写者的表达能力。结构可以工程化，语义说明的质量仍然需要经验和判断。

下一篇讨论声明式思维链的另一个核心概念：[Schema as Workflow](03-Schema-as-Workflow.md)——Schema 的字段排列如何定义 LLM 的推理路径。
