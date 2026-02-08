# 第三章 提示工程作为软件工程

## 核心问题

提示工程不应该是一门手艺。它应该是软件工程的一个分支，遵循软件工程的基本原则，同时发展出适应新范式的特有方法。

## 已有文章

- [Declarative Chain-of-Thought: Engineering Principles of Code as Prompt](../../Declarative%20Chain-of-Thought_%20Engineering%20Principles%20of%20Code%20as%20Prompt.md)

## 计划文章

- **从命令式到声明式：软件工程史的一个切面** -- 这个转变不是新事物，而是在 LLM 领域的又一次重演。汇编到 C，SQL 的出现，React 的声明式 UI——每次抽象层级的提升都遵循相同的结构性规律。
- **Prompt 的可维护性问题** -- 当 prompt 成为生产系统的组成部分，它就面临所有代码面临的问题：版本管理、回归测试、重构风险。区别在于它没有编译器帮你兜底。
- **Prompt 与代码的同构性** -- 一段好的 prompt 和一段好的代码在结构上有什么共同点？单一职责、关注点分离、最小惊讶原则——这些原则跨越了表达介质。
