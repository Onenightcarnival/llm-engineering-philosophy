---
originalLink: /chapters/01-认识论/00-概述
---

# Chapter 1 Epistemology: The Nature and Limits of LLMs

Before using LLMs as software components, you must first understand what they actually are. This chapter draws on computation theory and philosophy of language to build that understanding -- no machine learning parameters, loss functions, or training data involved.

This chapter is the philosophical foundation for the entire book. Every engineering decision that follows -- how to design prompts, how to use type systems, which architecture to choose, how to test -- starts from the epistemology established here. If your understanding of what LLMs fundamentally are is wrong, no amount of clever engineering downstream will hold up.

## Articles

- [One Token at a Time](01-one-token-at-a-time.md) -- The mechanics of autoregressive generation and their engineering implications. Sequentiality, locality, sampling strategies, confabulation, prompt sensitivity, and the incompatibility of generation and evaluation. Natural language interfaces reintroduce ambiguity; the solution is fuzzy on the outside, precise on the inside.
- [Software Engineering Without Certainty](02-software-engineering-without-certainty.md) -- After sixty years of deterministic assumptions are shattered, which engineering principles break and which become more important. The four levels of probabilistic behavior, cascading reliability decay, capability boundaries, and the division of labor in hybrid architectures.
