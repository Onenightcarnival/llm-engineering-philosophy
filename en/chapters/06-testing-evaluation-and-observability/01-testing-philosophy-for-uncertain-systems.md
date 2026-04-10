---
originalLink: /chapters/06-测试评估与可观测性/01-不确定性系统的测试哲学
---

# Testing Philosophy for Uncertain Systems

## Two Dimensions of Correctness

The "correctness" of LLM output has two independent dimensions.

**Structural correctness**: the output conforms to the expected format -- JSON is parseable, fields are present, types match, values fall within valid ranges. **Semantic correctness**: the meaning of the output is as expected -- a summary accurately reflects the source text, a classification result matches the business definition, a chain of reasoning is logically coherent.

An output can be structurally correct but semantically wrong (perfectly formatted JSON, but the sentiment classifier labels a positive review as negative). It can also be structurally wrong but semantically correct (the answer content is right, but it is not in the expected JSON format). The two dimensions require different strategies, and their independence is strong.

## Structural Testing Is a Solved Problem

[Chapter 4](../04-declarative-prompts-and-type-contracts/00-overview.md) already established a key judgment: the type system is the most effective structural constraint tool in LLM applications. The `model_validate_json` that a Pydantic model executes at parse time is itself a complete structural test -- field presence, type correctness, value ranges, enum constraints, cross-field consistency, all verified in a single parse call.

This means: if your Pydantic model is defined precisely enough, structural testing is already happening at runtime. Writing another round of pytest in CI to verify "does the output conform to the schema" is really testing Pydantic's own reliability. The engineering focus for structural testing should be on the precision of model definitions (the subject of Chapter 4).

The only scenario that calls for additional structural testing is **statistical measurement of structural compliance rate**: run the same prompt 100 times -- how many pass schema validation? That number is a valuable quality metric, and the way to get it is "multiple calls + statistics."

## Strategies for Semantic Testing

The core difficulty of semantic testing: there is no compiler that can tell you "this summary is accurate." But semantic testing can still be engineered. The following strategies each have different strengths.

**Rule-based assertions.** Some semantic constraints can be converted into programmatically checkable rules. For example, a summary should mention key entities from the source text -- use an NER tool to extract entity sets from both the source and the summary, compute recall, and set a threshold. The advantage of such rules is that they are deterministic, low-cost, and can run automatically in CI. The limitation is narrow coverage: they can only check semantic constraints expressible as rules, and many semantic judgments ("does this summary capture the main point") cannot be reduced to rules.

**Reference answer comparison.** Build a set of "gold standard" input-output pairs and compare LLM output against reference answers using similarity measures. Exact matching is not required -- use embedding similarity or text similarity metrics like ROUGE, with reasonable thresholds. The value of this approach is that it provides an anchor, but the thresholds themselves must be calibrated through experience.

**LLM-as-Judge.** Use another LLM (typically a stronger or different model) to evaluate the first LLM's output quality. This creates a nesting problem -- the judge itself is also uncertain. But in practice, a carefully prompted judge model can achieve adequate consistency. The key is to subject the judge's evaluations to statistical validation as well -- look at the distribution across multiple evaluations, not the conclusion of a single one.

Rule-based assertions are the simplest and most direct, but can only enforce hard constraints that are formalizable. Reference answer comparison extends to quality baselines for known scenarios. LLM-as-Judge can handle open-ended judgments, but at the highest cost and lowest reliability.

## The Real Battleground of Property-Based Testing

Traditional unit tests assert specific values: `assert f(3) == 9`. In LLM applications, such assertions fail -- the same input will not produce the same output. Property-based testing (PBT) offers a different approach: instead of asserting specific values, assert properties that the output must satisfy.

But this approach needs a critical dividing line: **which properties are worth verifying with property-based testing, and which are already covered by the type system?**

| Property Type | Example | Covered by Type System? | Needs Property Testing? |
|--------------|---------|------------------------|------------------------|
| Field presence and type | sentiment field is a string | Pydantic field definition | No |
| Value range | confidence is between 0 and 1 | `confloat(ge=0, le=1)` | No |
| Enum constraint | sentiment can only be positive/negative/neutral | `Literal[...]` | No |
| Cross-field consistency | When confidence is high, reasoning should contain evidence | `model_validator` | Depends on complexity |
| Input-output relationship | Summary length is shorter than source text | Cannot express | **Yes** |
| Perturbation invariance | Changing person names does not change sentiment judgment | Cannot express | **Yes** |
| Cross-invocation consistency | Core judgments are consistent across multiple calls with the same input | Cannot express | **Yes** |

The properties in the top half of the table -- field presence, value range, enum, cross-field consistency -- are the responsibility of the type system and validators discussed in Chapter 4. Using a PBT framework to randomly generate inputs to test these properties is essentially testing Pydantic's correctness.

The real incremental value of property-based testing lies in the bottom half: **relationships between input and output, invariance to input perturbations, and consistency across multiple invocations**. These properties cannot be expressed in single-output schema validation because they involve comparisons across multiple inputs or multiple calls.

Input-output relationship properties require understanding the constraints that should hold between input and output. Summaries should be shorter than the source text, translations should preserve the source's entities, classification results should not depend on irrelevant variations in the input -- these constraints can only be checked when you see both input and output simultaneously.

Perturbation invariance properties require the system to remain stable under specific transformations. Express the same content in different wording, and the sentiment analysis result should be consistent. Replace person names in the text with other names, and the summary structure should remain unchanged. These properties directly test model robustness and fairness.

Cross-invocation consistency properties require that the system's randomness does not affect core judgments. The same contract, key terms extracted multiple times should be consistent. The same question, core conclusions across multiple answers should be consistent. Inconsistent outputs do not necessarily mean any particular run is wrong, but consistency itself is a valuable quality signal.

## Practical Constraints of Property-Based Testing

LLM API calls have cost and latency. PBT frameworks default to generating large numbers of random inputs per test function -- reasonable for deterministic functions, but for tests that require LLM API calls, this can take too long and cost too much.

Practical adjustments: reduce sample counts (use a small number of samples for smoke testing in CI, periodically run comprehensive tests with large samples); cache LLM responses to avoid redundant calls (but be aware that caching masks output randomness -- cached-mode testing only checks whether a property holds on "one particular" output); layered testing -- input-output relationship properties require actual LLM calls, but can be run offline against existing output samples, decoupling API cost from test frequency.

## The Statistical Nature of Testing

Test results for LLM applications are inherently statistical. The same test case may produce different results across multiple runs. This is a fundamental characteristic of the system under test.

The engineering response is to accept the statistical nature and establish statistical quality standards: structural compliance rate (the proportion passing schema validation out of 100 runs), semantic accuracy (evaluation scores on a labeled test set), consistency (the proportion of core judgments that agree across multiple runs with the same input). These thresholds depend on the fault tolerance of the business scenario -- medical advice and marketing copy have vastly different tolerances. The key point: having an explicit, quantifiable quality standard is better than a standardless "looks good to me."

## Adapting the Test Pyramid

The traditional test pyramid (many unit tests, moderate integration tests, few end-to-end tests) needs adaptation for LLM applications.

**Bottom layer: type system validation.** High volume, automated, deterministic. Executed by Pydantic models at runtime, monitored in CI via structural compliance rate statistics. The cost of this layer is near zero -- it is part of the application code.

**Middle layer: component-level property and semantic tests.** Moderate volume, targeting properties and semantic quality of individual LLM calls. Uses labeled test sets, property assertions, and automated evaluation metrics. This layer is where the main testing engineering investment goes.

**Top layer: end-to-end semantic tests.** Low volume, covering complete business workflows. Typically requires human evaluation or high-quality LLM-as-Judge.

The bottom layer ensures the system will not fail in structurally incorrect ways. The middle layer ensures the quality of individual LLM calls is acceptable. The top layer ensures the overall system meets business requirements. This is consistent with the spirit of the traditional pyramid: coverage and cost form a pyramid distribution. But the bottom layer shifts from "many unit tests" to "the type system itself" -- this is the direct payoff of [Chapter 4](../04-declarative-prompts-and-type-contracts/00-overview.md)'s declarative constraints in the testing domain.
