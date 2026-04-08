# Pydantic 作为提示 DSL

本章前面的文章确立了一个核心主张：提示工程是软件工程的一个分支，声明式方法是这个分支的正确方向。本文将这个主张推向具体的技术实现。第一个问题是：如果 prompt 应该是声明式的，用什么语言来声明？

答案是类型系统。更具体地说，是 Pydantic 的 BaseModel。

## 从模板到类型：提示表达方式的演进

多数 LLM 应用的 prompt 构造经历了三个阶段。

第一阶段是字符串拼接。f-string、format、join——用 Python 的字符串操作直接组装 prompt。这个阶段的问题在[第七章](../07-反模式与陷阱/00-概述.md)会详细讨论，简言之：它与 SQL 拼接有相同的结构性缺陷。

第二阶段是模板引擎。Jinja2、Mustache、甚至自定义的模板语法。模板引擎解决了字符串拼接的可读性问题，但没有解决根本问题：模板的输出仍然是无类型的文本，模板的输入没有契约约束，模板的组合没有类型检查。

第三阶段是类型系统。用编程语言的类型定义来描述 LLM 的输入和输出结构。Pydantic 的 BaseModel 是这个阶段在 Python 生态中的最佳载体。

这三个阶段是抽象层级的递进，而非时间上的线性替代。字符串拼接是命令式的——你在描述"如何组装一段文本"。模板引擎是半声明式的——你在描述"文本的结构是什么样的"，但结构本身仍然是文本级别的。类型系统是完全声明式的——你在描述"数据的语义结构是什么"，文本只是这个结构的一种序列化形式。

## Pydantic BaseModel 的三层语义

一个 Pydantic 模型作为 prompt 规格说明时，它同时在三个层面发挥作用。

**类型注解是约束层。** `name: str`、`score: float`、`tags: list[str]` ——这些类型注解定义了 LLM 输出的结构约束。它们是契约。当 LLM 的输出被解析为 Pydantic 模型时，任何违反类型约束的值都会被拒绝。拒绝发生在运行时，约束的定义却在编码时——代码审查、静态分析和版本控制都能覆盖到。

**Field description 是语义层。** 这是 Pydantic 模型作为 prompt DSL 最关键的特性。

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

每个 Field 的 description 就是传递给 LLM 的语义指令。它告诉 LLM 这个字段"应该是什么"——通过与类型注解绑定的精确说明，而非自然语言段落的模糊描述。这种绑定的力量在于：语义说明和结构约束是同一个对象的两个面，不可能出现"描述说返回一个数字，但类型写了 str"这种不一致。

**Validator 是不变量层。** `ge=0.0, le=1.0` 定义了值域约束，自定义的 `field_validator` 和 `model_validator` 定义了更复杂的不变量——字段之间的一致性、业务规则的遵守、格式的精确匹配。这一层在后续文章中展开。

三层结构的组合效果是：一个 Pydantic 模型同时充当了类型定义、prompt 指令和输出验证器。一处定义，三处生效。

## 为什么选择 Pydantic

Python 生态中不缺数据定义工具：dataclass、TypedDict、attrs、marshmallow、甚至原生的 dict。选择 Pydantic 是工程判断。

**dataclass 缺少运行时验证。** dataclass 是类型注解的载体，但它不做运行时校验。`@dataclass` 装饰的类接受任何值赋给任何字段，只要你不额外添加 `__post_init__` 逻辑。对于 LLM 输出这种本质上不可信的外部输入，缺少运行时验证意味着把防线完全交给了下游代码。

**TypedDict 是纯结构性的。** TypedDict 定义了字典的键类型，但没有 description、没有 validator、没有序列化/反序列化逻辑。它是类型检查器的工具，不是运行时的工具。

**Pydantic 的独特位置在于它同时覆盖了三个层面：** 类型检查（通过注解）、语义传递（通过 Field description 和 json_schema_extra）、运行时验证（通过 validator）。更关键的是，Pydantic v2 原生支持 JSON Schema 导出——`model.model_json_schema()` 直接生成符合 JSON Schema 规范的结构描述，这正是主流 LLM API（OpenAI、Anthropic）所接受的 structured output 格式。

框架设计层面看，Pydantic 的定位恰好处于"类型系统"和"运行时验证"的交汇处。这个定位在传统 Web 开发中解决的是 API 输入验证问题；在 LLM 应用中，它解决的是同一类问题——约束不可信输出的结构和语义。

## 结构即推理路径

Pydantic 模型的字段顺序不仅是数据结构的组织方式，在 LLM structured output 的场景下，它同时定义了推理路径。

```python
class DocumentAnalysis(BaseModel):
    """分析一篇文档的核心论点和论证结构。"""

    main_topic: str = Field(
        description="文档讨论的核心主题，用一句话概括"
    )
    key_claims: list[str] = Field(
        description="文档中提出的关键主张，按重要性降序排列"
    )
    evidence_quality: str = Field(
        description="论证证据的质量评估：strong、moderate 或 weak"
    )
    conclusion: str = Field(
        description="基于以上分析得出的综合评价"
    )
```

当 LLM 以 structured output 模式处理这个模型时，它会按字段顺序生成：先识别主题，再提取主张，然后评估证据质量，最后给出结论。这个顺序不是随意的——它反映了一个合理的分析推理链。`conclusion` 字段的生成可以"看到"前面所有字段的值，这意味着它的判断建立在先前分析的基础上。

这就是"结构即推理路径"的含义：Pydantic 模型的字段排列隐式地定义了 Chain-of-Thought 的步骤。传统的 CoT 通过自然语言指令引导推理（"先想一想...然后分析..."），声明式 CoT 通过结构定义引导推理——前者依赖 LLM 对自然语言指令的理解，后者通过输出格式的物理约束来强制执行。

## 组合与嵌套

类型系统的力量在于组合性。简单类型通过嵌套和引用构建复杂结构，每一层都保持独立的语义完整性。

```python
class Entity(BaseModel):
    name: str = Field(description="实体名称")
    entity_type: str = Field(description="实体类型：person、organization 或 location")

class Relation(BaseModel):
    source: str = Field(description="关系的起始实体名称")
    target: str = Field(description="关系的目标实体名称")
    relation_type: str = Field(description="关系类型的简要描述")

class KnowledgeGraph(BaseModel):
    """从文本中提取知识图谱。"""
    entities: list[Entity] = Field(description="文本中识别出的所有实体")
    relations: list[Relation] = Field(description="实体之间的关系")
    summary: str = Field(description="知识图谱的整体概述")
```

`Entity` 和 `Relation` 是独立的、可复用的类型定义。`KnowledgeGraph` 通过组合它们构建更复杂的输出结构。每个子模型都可以独立测试、独立演进。这与软件工程中模块化设计的原则完全一致——高内聚、低耦合，通过接口（类型定义）而非实现（自然语言描述）来组合。

## 适用边界

Pydantic 作为 prompt DSL 有明确的适用边界。

**创意性任务的过度约束。** 当任务本身需要开放式输出（文学创作、头脑风暴、自由形式的对话）时，强制 structured output 会抑制 LLM 的表现。类型系统擅长约束，但约束不总是美德——在问题空间本身是模糊的场景下，过度精确的约束会排除正确答案。

**模型能力的依赖。** 不是所有 LLM 都能可靠地遵循复杂的 JSON Schema。嵌套层级过深、字段数量过多、约束条件过于复杂——这些都会降低输出的合规率。Pydantic 模型的复杂度需要与目标模型的能力匹配。

**Description 的质量仍然是手艺。** 虽然 Pydantic 提供了结构化的框架，但每个 Field 的 description 仍然是自然语言，仍然依赖编写者的表达能力。结构可以工程化，语义说明的质量仍然需要经验和判断。

这些局限性划定了 Pydantic 作为 prompt DSL 的适用边界。本章论证的命令式到声明式的跃迁是一个方向。类型系统是这个方向上当前最好的工具，但工具有其边界——认识边界本身就是工程判断力的体现。
