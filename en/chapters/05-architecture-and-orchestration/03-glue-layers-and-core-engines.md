---
originalLink: /chapters/05-架构与编排/03-胶水层与核心引擎
---

# Glue Layers and Core Engines

## Two Architectural Roles

The LLM's role in an application architecture falls into only two fundamental patterns. Every variant is a combination or intermediate state of these two.

**Glue layer pattern:** The LLM handles connection, transformation, and routing, while core business logic resides in deterministic code. The LLM understands user intent and maps it to system calls, but does not directly execute business decisions.

**Core engine pattern:** The LLM itself is the business logic. Content generation, creative writing, conversational interaction, complex reasoning -- the LLM's output is directly the product's value.

The test for distinguishing these two patterns is straightforward: **if you replaced the LLM with a perfect natural language understanding module (one that always correctly parses intent) plus a set of if-else routes, would the system's core functionality still work?** If yes, the LLM is a glue layer. If no, the LLM is a core engine.

The engineering significance of this distinction: the two patterns have fundamentally different requirements for reliability, testing strategy, and architectural design.

## Architectural Characteristics of the Glue Layer Pattern

```
User Input -> [LLM: Intent Recognition + Parameter Extraction] -> [Deterministic Logic: Business Processing] -> [LLM: Result Formatting] -> Output
```

In the glue layer pattern, the LLM appears at the edges of the system: the input side handles understanding and structuring; the output side handles natural language generation. The business logic in the middle is deterministic -- database queries, rule engines, computation pipelines.

The advantages of this architecture:

**Controllable reliability.** Core business logic is deterministic and its correctness can be guaranteed through traditional testing. The LLM's non-determinism is confined to the system's edges; even if the LLM occasionally misparses, the impact is limited.

**High replaceability.** LLM modules can be upgraded or swapped independently without affecting core logic. Switching from GPT-4 to Claude, or from a cloud API to a local model, requires only changes to the adaptation layer at the edges.

**Predictable cost.** The frequency and complexity of LLM calls can be precisely controlled -- each user request triggers a fixed 1-2 LLM calls, and token consumption is estimable.

Most commercial applications should choose this pattern. E-commerce customer service, enterprise knowledge Q&A, data analysis assistants -- the core value of these applications lies in the backend business systems and data. The LLM's role is to let users interact with these systems through natural language.

## Architectural Characteristics of the Core Engine Pattern

```
User Input -> [LLM: Core Processing] -> Output
              ^ Optional tool assistance v
```

In the core engine pattern, the LLM is the primary value creator. The user requests "write a technical blog post," "refactor this code into a functional style," "design test cases for this API" -- the output quality of these tasks depends directly on the LLM's capabilities, and no deterministic code can substitute.

The characteristics of this architecture:

**Quality ceiling depends on the model.** The system's capability ceiling is the LLM's capability ceiling. Model upgrades can directly improve product quality, but conversely, the product's core competitiveness is tied to whichever model you chose.

**Non-determinism is itself a product feature.** The value of content generation lies precisely in each output being different -- if the same text were generated every time, you would not need an LLM. So the traditional "input-output consistency" testing strategy does not apply.

**Cost and quality are strongly positively correlated.** Longer context, more reasoning steps, more powerful models -- every lever for improving quality directly increases cost. Cost optimization may harm product quality.

## Mixed Patterns and Boundary Judgment

Real systems are typically a mix of both patterns. The key is making the correct positioning judgment for each component.

```python
# Mixed pattern example: intelligent customer service system

# Glue layer: intent classification (LLM could be replaced by rules)
intent = classify_intent(user_message)  # LLM call

# Deterministic logic: business processing
if intent == "check_order":
    result = order_service.get_status(order_id)  # Database query
elif intent == "request_refund":
    result = refund_service.initiate(order_id)   # Business workflow

# Core engine: personalized response generation (LLM irreplaceable)
response = generate_response(result, user_context)  # LLM call
```

Intent classification is a glue layer -- it could theoretically be replaced by a rule engine; the LLM just makes it more flexible. Business processing is deterministic logic -- it must execute precisely. Response generation is a core engine -- natural, personalized replies require the LLM's generative capability.

The principle for boundary judgment: **anything requiring precision and consistency (computation, data queries, state changes) goes in deterministic code; anything requiring flexibility and naturalness (understanding intent, generating text, handling ambiguous input) goes to the LLM.** Do not ask the LLM to do what it is bad at (precise computation), and do not ask deterministic code to do what it is bad at (understanding natural language).

## Architectural Positioning Determines Testing Strategy

In the glue layer pattern, the testing focus for LLM modules is **classification accuracy and parameter extraction accuracy** -- run a set of inputs and check whether the LLM correctly identified the intent and extracted the parameters. This can be measured with traditional precision/recall metrics and regression-tested against labeled datasets.

In the core engine pattern, the testing focus is **the statistical distribution of output quality** -- whether quality across multiple outputs remains stable at an acceptable level. This requires the evaluation-as-testing methods discussed in [Chapter 6](../06-testing-evaluation-and-observability/00-overview.md).

In the mixed pattern, each component is tested according to its positioning. Deterministic parts get unit tests, glue layer parts get classification tests, core engine parts get statistical evaluation. This layered testing strategy is more efficient than end-to-end testing because it confines non-determinism to the smallest possible scope.
