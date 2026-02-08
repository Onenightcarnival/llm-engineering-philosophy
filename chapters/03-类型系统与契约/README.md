# 第三章 类型系统与契约

## 核心问题

类型系统是人类在软件工程中发明的最强大的约束传播机制之一。当 LLM 的输出从自由文本变为结构化数据，类型系统的力量得以在这个新领域释放。

## 计划文章

- **Pydantic 作为 Prompt DSL** -- Pydantic 的 BaseModel 不仅是数据验证工具，更是一种面向 LLM 的领域特定语言。Field description 是语义层，type annotation 是约束层，validator 是不变量层。三者共同构成一套完整的 prompt 规格说明。
- **JSON Schema：机器可读的契约** -- Schema 不是"输出格式要求"，而是调用者与 LLM 之间的契约。契约的本质是双方的权利与义务，这个视角如何改变 Schema 的设计方式。
- **Literal 类型与决策空间的显式化** -- 枚举不是限制，是对问题空间的精确建模。当你把选项从无限压缩到有限，你同时做了两件事：降低了 LLM 的输出熵，提高了下游系统的可处理性。
- **验证器作为运行时不变量** -- field_validator 和 model_validator 不只是"校验"，它们定义了系统在任何时刻都必须满足的不变量。这与 Design by Contract 的思想一脉相承。
