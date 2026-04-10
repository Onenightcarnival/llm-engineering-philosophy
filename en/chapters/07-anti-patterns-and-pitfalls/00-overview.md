---
originalLink: /chapters/07-反模式与陷阱/00-概述
---

# Chapter 7 Anti-Patterns and Pitfalls

Knowing what not to do is as important as knowing what to do. In a fast-evolving field with little consensus, guidance on "what to avoid" is worth no less than guidance on "what to pursue."

LLM application development is rife with practices that seem reasonable but are actually harmful. They persist because they work fine during prototyping and only reveal their damage in production -- by which point the technical debt has accumulated to the point of being nearly impossible to clean up.

## Articles

- [The Fragility of Prompt Concatenation](01-the-fragility-of-prompt-concatenation.md) -- Building prompts through string concatenation has the same structural flaws as building SQL queries through concatenation: injection risk, escaping issues, and readability disasters. Template engines only solve the syntax problem.
- [Engineering Constraints of Model Selection](02-engineering-constraints-of-model-selection.md) -- Model selection is a multi-dimensional constrained optimization problem. The supply chain risk of single-model dependency (four forms of change: upgrades, deprecation, price increases, and quality degradation) and the multiplicative structure of cost are different dimensions within the same decision space, and must be considered together at design time.
- [Misjudging Capability Boundaries](03-misjudging-capability-boundaries.md) -- Two symmetrical mistakes: overestimating the LLM's capabilities (using a language model as a database, relying on statistical compression for factual queries) and overestimating framework abstractions (framework lock-in, where two layers of uncertainty compound and amplify debugging difficulty). Both amount to placing a tool where it does not belong.
- [Treating Uncertainty as a Defect](04-treating-uncertainty-as-a-defect.md) -- The most insidious anti-pattern. Attempting to eliminate output instability by endlessly stacking rules is fighting the system's essential nature. Three architecture-level alternatives. The book's closing argument -- returning to the epistemology of [Chapter 1](../01-epistemology/00-overview.md) and the decision framework of [Chapter 2](../02-uncertainty-and-decisions/00-overview.md).
- [When to Move from Prompting to Fine-Tuning](05-when-to-move-from-prompting-to-fine-tuning.md) -- A practical engineering decision. The capability ceiling of prompt engineering, the cost structure and risk profile of fine-tuning, and the "prompt first, fine-tuning as fallback" decision framework. When prompt optimization has already plateaued, continuing to invest at the prompt level is itself an anti-pattern.

## Reading Order

The five articles are arranged by how well-hidden the harm is: from visible (security risks of prompt concatenation) to semi-hidden (model selection constraints, capability boundary misjudgment) to most hidden (treating uncertainty as a defect, continuing to invest in prompting after it has plateaued). The more insidious the anti-pattern, the more likely it is that what is wrong is not the code, but the goal.
