# 大模型应用开发的工程哲学

当软件系统的核心组件从确定性函数变成概率性语言模型，软件工程的基本原则会发生什么变化，又有什么不会变。

这不是一本 prompt 手册，不是一份框架文档，而是一个软件工程博士对"大模型时代的工程方法论"这个问题的系统性回答。内容以个人观点和哲学观为底色，侧重对事物本质结构的揭示和对未来形态的构想。

---

## 目录

### [第零章 序章：为什么写这本书](chapters/00-序章/README.md)

不是又一本 prompt 手册。定位与边界声明。

### [第一章 认识论：大模型的本质与边界](chapters/01-认识论/README.md)

从计算理论和语言哲学的角度理解大模型到底是什么。自回归生成的本质、语言作为接口的含义、确定性与概率性的根本张力。全书的哲学地基。

- [自回归生成的本质](chapters/01-认识论/autoregressive-generation.md)
- [语言作为接口：比 API 更古老，比 API 更模糊](chapters/01-认识论/language-as-interface.md)
- [确定性与概率性的根本张力](chapters/01-认识论/determinism-vs-probability.md)
- [大模型不擅长什么](chapters/01-认识论/what-llms-cannot-do.md)

### [第二章 不确定性与决策](chapters/02-不确定性与决策/README.md)

不确定性环境下的工程决策框架。Strategy 大于 analysis，知行合一，恐慌时刻的逆向思维，决策的数学结构。全书的方法论地基。

- [Strategy 大于 Analysis：工程决策的第一原则](chapters/02-不确定性与决策/strategy-over-analysis.md)
- [不确定性不是敌人，是约束条件](chapters/02-不确定性与决策/uncertainty-as-constraint.md)
- [恐慌时刻的逆向工程](chapters/02-不确定性与决策/contrarian-engineering.md)
- [知行合一：从设计到实现的一致性](chapters/02-不确定性与决策/design-implementation-consistency.md)
- [决策的数学结构](chapters/02-不确定性与决策/decision-mathematics.md)

### [第三章 提示工程作为软件工程](chapters/03-提示工程作为软件工程/README.md)

从命令式到声明式的范式跃迁，"Code as Prompt"的核心主张。提示工程不是手艺，是软件工程的一个分支。

- [从命令式到声明式：软件工程史的一个切面](chapters/03-提示工程作为软件工程/imperative-to-declarative.md)
- [Prompt 的可维护性问题](chapters/03-提示工程作为软件工程/prompt-maintainability.md)
- [Prompt 与代码的同构性](chapters/03-提示工程作为软件工程/prompt-code-isomorphism.md)
- [Declarative Chain-of-Thought: Engineering Principles of Code as Prompt](chapters/03-提示工程作为软件工程/declarative-chain-of-thought.md)

### [第四章 类型系统与契约](chapters/04-类型系统与契约/README.md)

用编程语言的形式化能力约束 LLM。Pydantic 作为 Prompt DSL、JSON Schema 作为契约、Literal 类型作为决策空间的显式枚举。

### [第五章 架构模式](chapters/05-架构模式/README.md)

LLM 应用的结构设计。RAG 的本质、Agent 的结构分解、LLM 作为胶水层 vs 核心引擎、状态管理与会话设计。

### [第六章 工作流与编排](chapters/06-工作流与编排/README.md)

复杂任务的分解与组合。隐式编排 vs 显式编排、错误传播与补偿、以及为什么大多数编排框架过度设计了。

### [第七章 测试与可靠性](chapters/07-测试与可靠性/README.md)

不确定性系统的质量保障。结构测试与语义测试、基于属性的测试、评估即测试、可观测性与优雅降级。

### [第八章 数据科学与计算思维](chapters/08-数据科学与计算思维/README.md)

数据科学与计算数学思维在 LLM 应用中的投射。收敛性分析、数值稳定性隐喻、实验管理、数据飞轮。

### [第九章 人机协作的软件过程](chapters/09-人机协作的软件过程/README.md)

开发方法论的重构。AI 辅助编程、人机分工、文档驱动开发的复兴、知识库作为活的规格说明。

### [第十章 反模式与陷阱](chapters/10-反模式与陷阱/README.md)

值得警惕的实践。Prompt 拼接的脆弱性、模型锁定、成本盲区、框架崇拜，以及最隐蔽的反模式——把不确定性当 bug。

### [第十一章 终章：软件工程的下一个形态](chapters/11-终章/README.md)

范式转换的历史节奏、规格说明的回归、软件工程师的下一个身份。

---

## 关于

作者：计算机博士（软件工程、数据科学），数学学位（计算数学）。十余年投资实战经验。

写作立场：表达个人观点与哲学观，不追求从众，不依赖权威背书。一句话的正确与否不在于是谁说的。

语言：中文为主，后续考虑扩展英文翻译。

许可：见 [LICENSE](LICENSE)。
