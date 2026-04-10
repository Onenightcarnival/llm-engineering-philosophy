---
originalLink: /chapters/02-不确定性与决策/02-不确定性是约束条件
---

# The Constraint Structure of Uncertainty

## Probabilistic Output Is a Constraint

Probabilistic output is an intrinsic property of LLMs. [Chapter 1](../01-epistemology/01-one-token-at-a-time.md) explained this at the mathematical level: every generation step is a sample from a conditional probability distribution. Probability is baked into the mechanism.

The engineer's instinctive reaction to probabilistic output is "how do I eliminate it." That direction is wrong. Probabilistic output is an inherent property of the autoregressive generation mechanism; what engineering can do is manage it. The right question is: given that uncertainty cannot be eliminated, how do you build reliable systems on top of it?

So the design center of gravity for architecture is tolerating errors, not pursuing correctness on every single call. LLM output needs to be parsed and validated; if validation fails, retry or fall back. The process should return not just the result but also metadata about how it got there -- how many attempts, whether a fallback was triggered. In an uncertain environment, "how the result was produced" matters as much as "what the result is."

## Two Core Constraint Parameters

Uncertainty can be formalized into two parameters: **single-call reliability** (even with the best prompt and the best model, every single call has some failure probability) and **output consistency** (the degree of consistency across multiple calls with the same input). These two parameters frame the problem precisely; good architecture is about finding the optimal solution within these constraints.

Two fundamental laws:

**Serial degradation.** In a multi-step serial system, each step multiplies its own reliability as a discount factor. The more steps, the steeper the discount. Five steps in series, each at 95% reliability, and system reliability drops to 77%. Ten steps drops it to 60%. This is a hard constraint that probability theory imposes on architecture, regardless of how good your prompt is.

**Redundancy hedging.** Run the same call independently multiple times; as long as one succeeds, the whole thing counts as a success. The higher the single-call reliability, the fewer redundant calls you need; the lower the single-call reliability, the greater the marginal benefit of redundancy.

This yields an architectural insight: rather than obsessing over perfection on a single call, use redundant calls to achieve the same reliability -- it is often more economical and more predictable. Perfection on a single call is difficult, but the math of redundant calls is simple.

## Uncertainty Budget

The amount of uncertainty a system can tolerate is finite. An internal document search tool has a generous uncertainty budget -- returning slightly irrelevant results occasionally is acceptable to users. An automated trading system has an uncertainty budget approaching zero.

The logic of budget allocation follows from serial degradation: the total failure rate the system can tolerate is fixed, so the more steps there are, the less failure rate budget each step gets, and the more demanding the reliability requirement for each individual step becomes.

An easily overlooked trade-off: increasing the number of LLM call steps in a system is itself consuming the uncertainty budget. A 10-step Agent pipeline, even with 98% reliability per step, has a system-level reliability of only 82%. The countermeasure lies at the architectural level -- reduce the number of steps; merge calls wherever possible.

## Defensive Architectural Patterns

Since uncertainty is a constraint, there are corresponding architectural patterns to deal with it.

**Validate-retry.** LLM output goes through structured validation (type checking, schema validation, business rule validation); if it fails, retry. The premise is that LLM failures are approximately statistically independent, so a retry has a reasonable chance of producing a different result. Using Pydantic for output validation is the most straightforward implementation: define the expected output structure, automatically trigger a retry on parse failure, and set an upper limit on retry count.

**Fallback chain.** The system arranges a set of strategies in descending order of quality: first attempt LLM generation; if that fails, fall back to an extractive method; if that fails too, fall back to a deterministic fallback (e.g., simple truncation). The last strategy in the chain must never fail. The essence of this pattern is: accept a controlled concession in quality in exchange for certainty in availability.

**Majority voting.** Make multiple LLM calls on the same input and take the majority-consistent result. This works for scenarios where the output is a discrete category (classification, judgment, selection). The core assumption is that the correct output is a high-probability event and incorrect outputs are low-probability and dispersed -- taking the mode across multiple samples improves reliability. This assumption usually holds for classification tasks and usually does not hold for generation tasks (because there is no single "correct" generation).

The three patterns have different cost structures. Retry trades latency for reliability -- worst-case latency is a multiple of the retry count, but expected cost increase is limited (most of the time the first call succeeds). Majority voting trades cost for reliability -- call count is a fixed multiple, but if executed in parallel, latency does not increase. Which pattern to choose depends on whether the system's binding constraint is cost or latency.

## The Risk Advantage of Simple Architecture

There is another dimension of architectural choice that is easy to overlook: variance. Complex architectures often have a higher ceiling, but their variance is much larger too. A single LLM call plus Pydantic validation, in the worst case, might just mean a graceful fallback; a three-step Agent plus RAG plus multi-model ensemble, in the worst case, might mean cascading failure and extended unavailability. A high ceiling with high volatility is not necessarily better than a stable medium result -- for the same expected return, higher volatility means less predictable actual performance. In most production scenarios, a stable medium result is more valuable than a high-ceiling, high-volatility alternative.

## Continuous Calibration

Uncertainty management also involves a temporal dimension: judgments should be continuously updated as new evidence arrives.

The key to updating is the information content of the evidence. A blind test across a hundred samples should substantially shift your judgment; "no complaints since launch" should barely move it. A single strong piece of negative evidence can overturn the confidence accumulated by multiple prior positive data points -- for example, discovering that an entire class of specially formatted inputs all fail is enough to overturn the confidence you gained from "nine out of ten samples were correct."

Good judgment is incrementally corrected. The weight of each piece of evidence depends on its information content. Throughout the process, the judgment is always being calibrated.

## After Making Constraints Explicit

Once you quantify the constraints of uncertainty, engineering design actually becomes more flexible.

Validation layers and fallback strategies guarantee the system's reliability, so the prompt only needs to be good enough. The model occasionally makes mistakes; the architecture handles them. The architecture's effectiveness is not tied to a specific model -- swap the model and the architecture still holds.

For LLM engineering, the truly controllable variables are: system architecture, validation logic, fallback strategies, and the monitoring system. Reliability comes from the engineering structure wrapped around the LLM, and that is where engineering effort should be concentrated.
