# JSON Schema：机器可读的契约

## 契约的本质

Design by Contract 的核心思想是：调用者和被调用者之间存在一份契约，规定了双方的权利与义务。调用者有义务提供满足前置条件的输入，被调用者有义务返回满足后置条件的输出。违反契约的一方承担责任。

在传统软件工程中，这份契约可以由类型签名、接口定义、API Schema 来承载。在 LLM 应用中，JSON Schema 扮演了同样的角色——但有一个根本性的不同：LLM 不是一个确定性的被调用者，它不"理解"契约的法律含义，它只是在概率空间中生成符合（或不符合）Schema 约束的输出。

这个差异不意味着契约思想不适用。它意味着契约的执行机制需要从"编译期保证"转向"运行时验证 + 重试"。契约的定义方式不变，执行方式变了。

## Schema 不是格式要求

多数开发者在 LLM 应用中使用 JSON Schema 时，将其视为"输出格式要求"——告诉 LLM "请返回这个格式的 JSON"。这个理解是浅层的。

格式要求是单方面的：它只约束输出的语法结构。契约是双向的：它同时约束输出的结构和语义，并隐含了调用者的承诺——"我会按照这个 Schema 来解析你的输出，如果你的输出符合 Schema，我保证能正确处理它"。

这个区分的工程意义在于：当你把 Schema 视为格式要求，你倾向于在 Schema 中塞入尽可能多的约束，试图用格式来弥补语义的模糊；当你把 Schema 视为契约，你会清晰地区分三类约束：

1. **结构约束**：字段名、类型、嵌套关系。这是 Schema 的核心职责。
2. **值域约束**：枚举值、数值范围、字符串模式。这是 Schema 可以表达的。
3. **语义约束**：字段的含义、字段之间的业务关系。这是 Schema 的 description 字段承载的，但本质上仍然依赖 LLM 的"理解"。

清晰的分层意味着：结构约束和值域约束可以被机器严格验证（解析失败即拒绝），语义约束只能被弱验证（通过启发式规则或二次 LLM 调用）。混淆这三层会导致虚假的安全感——开发者以为 Schema 验证通过就意味着输出正确，实际上只意味着输出的格式正确。

## 从 Pydantic 到 JSON Schema 的投影

Pydantic 模型和 JSON Schema 之间存在一个精确的映射关系。`model_json_schema()` 方法将 Pydantic 模型投影为 JSON Schema，这个投影保留了结构约束和值域约束，但不可避免地丢失了 Python 级别的表达能力。

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

调用 `ReviewAnalysis.model_json_schema()` 生成的 JSON Schema 包含了 `enum`（来自 Literal）、`minimum`/`maximum`（来自 ge/le）、`minItems`/`maxItems`（来自 min_length/max_length）等约束。这些约束在 Schema 层面是可机器验证的。

但 Pydantic 的 `field_validator` 和 `model_validator` 不会出现在 JSON Schema 中——它们是 Python 运行时的逻辑，无法序列化为 Schema 约束。这意味着 JSON Schema 是 Pydantic 模型的一个"有损投影"：它保留了 Schema 词汇表能表达的约束（类型、枚举、值域范围），丢失了需要程序逻辑才能表达的约束（字段间关系、格式校验、业务规则）。

这个有损性标记了 JSON Schema 表达能力的上限。上限之内的约束交给 Schema 验证器，在 LLM 生成时就能强制执行；上限之外的约束交给 Pydantic 的运行时验证，在解析输出时执行。两层防线各司其职。

## 契约的版本演化

生产系统中的 Schema 不是一成不变的。业务需求变化、模型能力升级、下游系统改造——这些都可能驱动 Schema 的演化。契约视角下的 Schema 版本管理需要回答三个问题：

**向后兼容意味着什么？** 在传统 API 中，向后兼容意味着旧客户端能正常使用新版 API。在 LLM 应用中，向后兼容意味着旧版 Schema 对应的解析逻辑能正常处理新版 Schema 的输出。新增可选字段是安全的（旧解析器忽略它），删除字段或改变类型是破坏性的。

**Schema 变更如何测试？** Schema 变更不能只测试"新 Schema 能否解析新输出"，还需要测试"新 Schema 对应的 prompt 是否产生了预期质量的输出"。结构变化可能影响 LLM 的推理路径——在第一篇中讨论过，字段顺序就是推理顺序。

**何时应该引入新版本？** 当 Schema 变更影响输出的语义结构时（不仅仅是新增字段），应该引入新版本。版本化的 Schema 让你可以同时运行新旧两个版本进行 A/B 对比，而不是在生产环境中进行不可回滚的切换。

## Schema 作为文档

JSON Schema 的一个常被忽视的价值是其文档属性。一个定义良好的 Schema，连同其 description 字段，本身就是 LLM 输出结构的精确文档。

这种"Schema 即文档"的属性在团队协作中尤其有价值。当一个新成员需要理解"这个 LLM 调用会返回什么"时，阅读 Schema 比阅读 prompt 模板更高效——Schema 是结构化的、可导航的、有类型信息的；prompt 模板通常是一段混杂了指令、示例和格式要求的自然语言文本。

更进一步，Schema 可以被自动化工具消费：生成 API 文档、生成客户端类型定义、生成测试用例模板。这些自动化能力来自 Schema 的机器可读性——而机器可读性正是从自然语言 prompt 到类型系统的跃迁所带来的根本收益。

## 表达能力的边界

JSON Schema 的表达能力是有限的。它能表达的约束是"值的属性"级别的：类型、范围、枚举、模式匹配、数组长度。它不能表达"值之间的关系"：字段 A 的值决定字段 B 的取值范围、两个字段的和必须等于第三个字段、某个字段的存在取决于另一个字段的值。

这些关系性约束在实际业务中普遍存在，但只能在 Pydantic 的 validator 层面处理，或者通过 prompt 中的自然语言说明来"提示" LLM。这就是为什么本章需要四篇文章来完整讨论类型系统与契约——JSON Schema 是契约的结构骨架，Literal 类型是决策空间的显式化，validator 是运行时不变量的最后防线。它们之间是互补关系。
