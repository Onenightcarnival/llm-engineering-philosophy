---
originalLink: /chapters/05-架构与编排/00-概述
---

# Chapter 5 Architecture and Orchestration

LLM applications are not without architecture. Once complexity crosses a certain threshold, structural design becomes unavoidable. The real questions are: which architectural patterns does this domain actually need, which are transplanted wholesale from traditional software engineering without adaptation; and when these structures need dynamic execution, which layer should own orchestration, and who controls it.

The previous chapter dealt with constraints at the level of a single LLM call. This chapter lifts the perspective to the system level: when an application involves multiple LLM calls, external tools, data stores, and business logic, how do you organize the relationships among them (architecture), and how do you make these components execute in the right order (orchestration).

## Articles

- [The Essence of RAG](01-the-essence-of-rag.md) -- RAG has been over-packaged. Strip away the framework wrappers and the core operation is nothing more than "stuff relevant information into the context before calling the LLM." Understanding this essence is how you judge when RAG is needed, when it is not, and why retrieval quality is the real bottleneck.
- [Structural Decomposition of Agents](02-structural-decomposition-of-agents.md) -- Agent is not a mysterious concept. It is a combination of "LLM + tool calling + loop control." This article dismantles the minimal Agent structure and discusses tool binding principles, termination condition design, and state machine formalization.
- [Glue Layers and Core Engines](03-glue-layers-and-core-engines.md) -- Two fundamentally different architectural roles. The former means the LLM handles connection and transformation while core logic remains in deterministic code; the latter means the LLM itself is the business logic. This positioning determines your testing strategy and reliability model.
- [Implicit vs Explicit Orchestration](04-implicit-vs-explicit-orchestration.md) -- Two fundamentally different orchestration paradigms. Implicit orchestration drives execution flow through data structures; explicit orchestration defines execution graphs in code. Implicit orchestration is severely underestimated. And why, in most scenarios, Python itself is the best orchestration language.
- [Error Propagation and Compensation](05-error-propagation-and-compensation.md) -- The four failure modes of LLM calls (hard failure, format failure, semantic drift, hallucination), the cascading effects of error propagation in multi-step workflows, and the design of validation checkpoints and compensation strategies.
- [Over-Engineering Orchestration Frameworks](06-over-engineering-orchestration-frameworks.md) -- An opinion piece. Abstraction level bloat, concept overload, and unnecessary indirection. Legitimate use cases for frameworks, and the alternative of "frameworkless orchestration."

## Reading Order

The first three articles cover the static dimension of architecture: RAG (where data comes from), Agents (how to interact with the outside world), and glue layers vs core engines (what role the LLM plays in the system). The last three cover the dynamic dimension of execution: orchestration paradigms, error propagation, and a critique of over-engineered orchestration frameworks.
