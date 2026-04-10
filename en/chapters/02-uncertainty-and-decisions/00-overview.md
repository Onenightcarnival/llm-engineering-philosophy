---
originalLink: /chapters/02-不确定性与决策/00-概述
---

# Chapter 2 Uncertainty and Decision-Making

The core difficulty of LLM application development is engineering decision-making under uncertainty. Information is never complete, but decisions cannot be deferred indefinitely. Strategic judgments -- whether a task should use an LLM at all, to what extent, and where the tolerance boundary for uncertainty lies -- are what determine whether a system succeeds or fails.

## Articles

- [Strategy Over Analysis](01-strategy-over-analysis.md) -- When strategic judgment is correct, tactical mistakes can be corrected; when strategic judgment is wrong, no amount of tactical excellence can salvage the outcome. A strategic decision framework, common tactical traps, and how to put strategic thinking into practice.
- [The Constraint Structure of Uncertainty](02-constraint-structure-of-uncertainty.md) -- Probabilistic output is an intrinsic property of LLMs. How uncertainty propagates and accumulates in systems (serial degradation, redundancy hedging), the logic of uncertainty budget allocation, defensive architectural patterns such as validate-retry, fallback chains, and majority voting, and the temporal dimension of continuous calibration.

## Reading Order

The first article establishes the principle: strategic direction matters more than tactical details. The second article unpacks the constraint structure of uncertainty -- serial degradation, redundancy hedging, budget allocation -- along with corresponding defensive architectural patterns. The declarative constraints, architectural choices, and testing methods in later chapters all build on the decision framework established here.
