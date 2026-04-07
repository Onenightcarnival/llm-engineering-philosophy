# Literal 类型与决策空间的显式化

## 从无限到有限

LLM 的默认输出空间是无限的——给定任何 prompt，理论上所有 token 序列都是可能的输出。这种无限性是 LLM 创造力的来源，同时也是工程可靠性的敌人。

工程化 LLM 应用的核心任务之一，是将这个无限的输出空间压缩到一个与问题相匹配的有限空间。类型系统是实现这种压缩的最精确工具。而在所有类型约束中，`Literal` 类型代表了约束的极端形式：将输出空间从无限直接压缩到一个显式枚举的有限集合。

```python
from typing import Literal

# 无约束：LLM可以返回任何字符串
sentiment: str

# Literal约束：输出空间被压缩到恰好三个值
sentiment: Literal["positive", "negative", "neutral"]
```

这个压缩的工程意义远超"限制输出格式"。它同时完成了三件事：降低了 LLM 的输出熵（更少的选择意味着更高的一致性），提高了下游系统的可处理性（有限枚举可以穷举处理），以及将模糊的语义分类转化为精确的计算对象。

## 决策空间的显式建模

软件工程中的许多任务本质上是分类决策。路由请求到不同的处理器、根据输入类型选择不同的策略、将非结构化输入映射到结构化的类别体系——这些都是从一个可能性空间映射到一个决策空间的操作。

当 LLM 参与这类决策时，决策空间的定义方式决定了系统的可靠性。

```python
from pydantic import BaseModel, Field
from typing import Literal

class IntentClassification(BaseModel):
    intent: Literal[
        "query_product",
        "place_order",
        "track_shipment",
        "request_refund",
        "general_inquiry"
    ] = Field(description="用户消息的意图分类")

    confidence: float = Field(
        description="分类置信度",
        ge=0.0, le=1.0
    )
```

`Literal` 类型在这里做的是**显式建模决策空间**。每一个枚举值对应下游系统的一条处理路径。枚举的完备性（是否覆盖了所有可能的意图）直接决定了系统的健壮性。遗漏一个意图类别，意味着某些用户请求会被强制归入错误的类别——这比返回"未知"更危险，因为错误分类会触发错误的处理逻辑，而"未知"至少可以触发人工干预。

这就是为什么 `general_inquiry` 这个兜底选项在实践中几乎是必须的。它是对决策空间完备性的工程保障——承认存在当前枚举无法覆盖的情况，并为这些情况提供显式的处理路径。

## 枚举粒度的权衡

决策空间的粒度是一个工程权衡，不存在普适的最优解。

**粒度太粗**意味着每个类别内部的变异性高。将所有"退货相关"的意图合并为 `return`，会让下游系统难以区分"想退货但还没操作""已经退货在等退款""对退货政策有疑问"这些需要不同处理的场景。

**粒度太细**意味着类别之间的边界模糊。将意图细分到 20 个以上的类别，LLM 的分类一致性会显著下降——因为相邻类别之间的语义距离太小，LLM 在不同次调用中可能将同一输入归入不同类别。

枚举粒度应该匹配 LLM 在该任务上的实际区分能力，而不是业务逻辑的理想精度。类别太少，每个类别内部差异太大，下游处理不了；类别太多，相邻类别之间界限模糊，LLM 分不清。

实践中的经验法则：一个 Literal 类型中的枚举值不超过 10 个。超过这个数量，考虑引入层级结构——先粗分类，再细分类。

```python
class CoarseIntent(BaseModel):
    category: Literal["order", "product", "account", "other"] = Field(
        description="意图的大类"
    )

class OrderIntent(BaseModel):
    sub_intent: Literal[
        "place_order", "cancel_order", "modify_order", "track_order"
    ] = Field(description="订单相关意图的细分类别")
```

层级化分类将一个高维的决策问题分解为多个低维的决策问题。每一层的 Literal 枚举都保持在 LLM 能可靠区分的粒度内。这是分治思想在约束设计中的体现。

## Literal 与 Enum 的选择

Python 提供了两种枚举机制：`typing.Literal` 和 `enum.Enum`。在 LLM 应用的上下文中，两者有不同的适用场景。

`Literal` 的优势在于轻量和 JSON Schema 友好。`Literal["a", "b", "c"]` 直接映射为 JSON Schema 的 `{"enum": ["a", "b", "c"]}`，没有额外的序列化开销。对于纯粹用于约束 LLM 输出的枚举，Literal 是更简洁的选择。

`Enum` 的优势在于它是一个完整的类型，可以附加方法、属性和文档。当枚举值不仅用于 LLM 输出约束，还需要在业务逻辑中被操作（遍历所有值、查找反向映射、附加元数据）时，Enum 提供了更丰富的抽象。

```python
from enum import Enum

class Priority(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"

    @property
    def sla_hours(self) -> int:
        return {"critical": 1, "high": 4, "medium": 24, "low": 72}[self.value]
```

继承 `str` 使得 `Priority` 的值是字符串，可以直接用于 JSON 序列化和 Pydantic 模型。附加的 `sla_hours` 属性将枚举值与业务逻辑绑定。这种模式在 LLM 分类结果需要驱动后续业务流程时特别有用。

选择标准很简单：如果枚举只用于约束 LLM 输出的取值范围，用 Literal；如果枚举值本身是业务领域的一等公民，用 Enum。

## 约束的前提

Literal 类型的约束力依赖于 LLM API 的 structured output 功能。当 API 支持严格的 JSON Schema 模式（如 OpenAI 的 strict mode），Literal 约束在 API 层面被强制执行——LLM 的 token 采样被限制在枚举值对应的 token 序列上。当 API 不支持严格模式，Literal 约束只是 Schema 中的一个 `enum` 声明，LLM 可能生成枚举之外的值，需要在解析时捕获并重试。

另一个局限是枚举值的语义传达。`Literal["positive", "negative", "neutral"]` 中的字符串值本身就是 LLM 的语义线索。选择 "positive" 还是 "pos"、"good" 还是 "favorable"，会影响 LLM 的分类行为。枚举值的命名不仅是代码风格问题，更是 prompt 设计问题——这再次印证了类型系统与提示工程的深层交织。
