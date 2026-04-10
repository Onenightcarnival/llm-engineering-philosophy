---
originalLink: /chapters/07-反模式与陷阱/02-模型选择的工程约束
---

# Engineering Constraints of Model Selection

## The Supply Chain Risk of a Single Vendor

There is a basic principle in supply chain management: critical components must never depend on a single supplier. An LLM application's dependence on a single model is no different, and arguably riskier -- model providers change far faster than traditional suppliers.

Model changes take four forms. Upgrades are breaking changes: shifts in model behavior are diffuse, statistical, and unpredictable. Prompts carefully tuned on the old version may fail completely on the new one. Model deprecation: when the specific version you depend on is retired, migration means re-tuning all prompts and re-running all evaluations. Pricing changes: a price increase or billing structure change can instantly invalidate your cost model. Quality degradation: the most insidious risk. The model performs worse on your specific use case after an update, but benchmarks measure average performance and will not sound the alarm for you.

Lock-in is a gradual process that deepens across three layers: at the prompt level (prompts tuned for a specific model may need to be redone for another), at the API level (different providers' interfaces are not fully compatible), and at the capability level (depending on features unique to a specific model). These three layers of lock-in reinforce each other, and switching costs grow over time.

## Cost Is an Architectural Constraint

Nearly every LLM application starts with an exciting prototype. API call costs are a few cents -- not worth thinking about. Then it goes live, and the end-of-month bill may make you wonder whether the project is viable at all.

This story repeats because cost has a multiplicative structure.

**Total cost = (input token unit price x input token count + output token unit price x output token count) x call frequency**

The prototyping phase typically focuses only on unit price while ignoring the two multipliers: token count and frequency. When those multipliers go from "a few manual tests" to "a hundred thousand calls per day in production," cost grows by five orders of magnitude. A typical RAG Q&A scenario with 100,000 daily calls can reach six-figure monthly costs in US dollars -- a number that can be estimated with simple multiplication at design time, no need to wait until after launch.

Hidden sources of cost are frequently overlooked: retrieved context injected per RAG call, accumulated history in multi-turn conversations, redundant calls from retries and validation, and the price differential where output tokens cost more than input tokens. When these multipliers stack, the actual call cost can be 2-3x what the business logic alone would require.

## Model Selection Is Multi-Dimensional Constrained Optimization

Model dependency risk and cost constraints are not two separate problems. They are different dimensions within the decision space of model selection. The correct approach is to incorporate both into a single decision framework at design time:

**Route by task complexity.** Different tasks are suited to different model sizes. Simple classification uses a small model, complex reasoning uses a large model, latency-sensitive tasks use a fast-responding model. Your business logic depends on interfaces you define; specific models are implementations of those interfaces -- when you need to switch, you modify the implementation and routing table, not API calls scattered across the codebase.

**Maintain substitutability at the architectural level.** Interfaces are organized by capability (text generation, structured output, classification); which specific provider is bound to each is an implementation detail. The value lies not in the complexity of the abstraction itself, but in establishing an architectural principle: business logic does not directly depend on a specific model provider.

**Factor cost into the design phase.** Cache identical or similar queries; compress retrieved context and conversation history; control output length through prompt design and `max_tokens`; batch-process latency-insensitive tasks. These are architectural choices that should be made at design time.

## An Evaluation System Is the Prerequisite for Multi-Model Strategy

A multi-model strategy without an evaluation system is empty talk. You need to maintain an evaluation set for each critical task and regularly run evaluations across multiple models. Routing decisions follow from evaluation results: which model offers the best cost-performance ratio for which class of tasks. When a model upgrade causes performance degradation, evaluation results will capture the change, and routing strategy adjusts accordingly.

The principle discussed in [Chapter 2](../02-uncertainty-and-decisions/02-constraint-structure-of-uncertainty.md) applies directly here -- the future behavior of model providers is uncertain, costs are uncertain, and the architecture must leave room for both kinds of uncertainty.
