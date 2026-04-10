---
originalLink: /chapters/06-测试评估与可观测性/00-概述
---

# Chapter 6 Testing, Evaluation, and Observability

How do you test a system whose outputs are nondeterministic? Traditional software testing rests on the assumption that the same input produces the same output. When that assumption no longer holds, the meaning of "testing" has to change.

The first five chapters covered how to design and build LLM applications -- epistemology, decision frameworks, development process, declarative constraints, architecture and orchestration. This chapter addresses an unavoidable question: how do you know the system is working correctly?

## Articles

- [Testing Philosophy for Uncertain Systems](01-testing-philosophy-for-uncertain-systems.md) -- Structural correctness and semantic correctness are two independent dimensions. Structural testing is already handled by the type system from Chapter 4 at parse time; the real battleground for testing is semantic validation and property-based testing -- specifically the input-output relationships, perturbation invariance, and cross-invocation consistency that type systems cannot express.
- [Experiment Management and Statistical Metrics](02-experiment-management-and-statistical-metrics.md) -- A prompt has a dual identity as both code and configuration. It needs version control, and more importantly, it needs experiment management: controlled variables, effect attribution, and statistical significance testing. How to define quantifiable quality dimensions and establish evaluation baselines with statistical rigor.
- [From Evaluation to Observability](03-from-evaluation-to-observability.md) -- The boundary between testing and evaluation dissolves in LLM applications. Evaluation metrics are test assertions; continuous evaluation is an online test suite. From offline evaluation to online monitoring forms a coherent chain. Observability is the natural runtime extension of evaluation -- detecting "successful failures," correlating prompt versions with output quality, and monitoring costs.
- [Graceful Degradation and Data Flywheels](04-graceful-degradation-and-data-flywheels.md) -- Degradation is part of normal operation. Five-tier degradation design, quantified trigger conditions, and the transparency principle. Plus how to build a positive feedback loop through user feedback, output logs, and human annotation -- turning degradation data into fuel for system improvement.

## Reading Order

The four articles progress from philosophy to practice: testing philosophy (structural testing is already covered by the type system; the real battleground is semantic validation), experiment management (prompt iteration should be a quantifiable experiment), from evaluation to observability (pre-launch quality gates and post-launch quality monitoring are two ends of the same line), graceful degradation and data flywheels (the last line of defense and the continuous improvement loop).
