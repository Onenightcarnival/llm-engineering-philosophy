---
originalLink: /chapters/05-架构与编排/05-错误传播与补偿机制
---

# Error Propagation and Compensation

## How LLM Calls Fail

Traditional API calls have only two outcomes: success or failure -- return the expected result or throw an exception. LLM calls have at least four distinct failure modes:

**Hard failure:** API timeout, rate limiting, service unavailable. Identical to traditional API failures; handle with standard retry and circuit-breaker mechanisms.

**Format failure:** The LLM returned content but it does not conform to the expected structure. JSON parsing fails, fields are missing, types do not match. The Pydantic validators discussed in Chapter 4 catch this class of error.

**Semantic drift:** The LLM returned structurally correct content, but the semantics deviate from expectations. It answered the wrong question, ignored key constraints, or generated irrelevant content. This is the hardest class of error to detect because it passes all structural validation.

**Hallucination:** The LLM returned structurally correct, seemingly reasonable, but factually incorrect content. It cited nonexistent references, fabricated data, or drew wrong conclusions. Hallucination is a special form of semantic drift, and it is especially dangerous -- because it typically presents with high confidence.

These four failure modes require different detection and handling strategies. The root cause of inadequate error handling in most LLM applications is treating all four as the same thing.

## Error Propagation in Multi-Step Workflows

In multi-step workflows, one step's erroneous output becomes the next step's erroneous input. The consequences of this error propagation are typically worse than the original error -- because downstream steps may make further incorrect inferences based on the wrong input, amplifying the error continuously.

```
Step A (correct input) -> semantically drifted output -> Step B (wrong input) -> further drift -> Step C -> completely wrong final result
```

This is the same structure as the cascading reliability problem discussed in [Chapter 1](../01-epistemology/02-software-engineering-without-certainty.md). If each step has a 90% probability of producing correct output, three steps in series yield an overall correctness rate of 0.9^3 = 72.9%. Five steps in series: 59%. The more steps, the faster overall reliability degrades.

Two engineering responses: reduce the number of steps (yet another reason implicit orchestration beats explicit), or insert validation checkpoints between steps.

## Validation Checkpoint Design

Validation checkpoints are explicit quality inspection stations within a workflow. At each checkpoint, the system checks whether the current step's output meets preset conditions, then decides whether to continue, retry, or abort.

```python
from pydantic import BaseModel, Field
from typing import Literal

class StepResult(BaseModel):
    output: dict
    confidence: float = Field(ge=0, le=1)

class ValidationDecision(BaseModel):
    action: Literal["continue", "retry", "abort"] = Field(
        description="Validation result: continue execution, retry current step, or abort workflow"
    )
    reason: str = Field(description="Reason for decision")

def execute_with_validation(steps: list, input_data: dict) -> dict:
    current = input_data
    for step in steps:
        for attempt in range(3):
            result = step.execute(current)

            if step.validate(result):
                current = result
                break
        else:
            # All three retries failed validation
            return {"status": "aborted", "failed_step": step.name}

    return {"status": "completed", "result": current}
```

Validation logic should be deterministic -- use code to check structural constraints and business rules. Using an LLM to judge whether output "seems reasonable" is just validating non-determinism with more non-determinism; it does not improve overall reliability.

## Compensation Strategies

When errors are unavoidable, the system needs compensation strategies to restore a consistent state.

**Retry.** The simplest compensation: re-execute the failed step with the same input. Suitable for hard failures and format failures. For semantic drift, blind retry may return the same wrong result -- because the same prompt in the same context tends to produce similar output.

**Retry with feedback.** Append error information to the prompt, explicitly telling the LLM what was wrong with the previous output. More effective than blind retry because the LLM receives additional information about the failure reason.

**Degradation.** Replace the failed step with a simpler but more reliable method. If the LLM's intent classification fails, fall back to keyword-based rule matching; if complex reasoning fails, fall back to a templated response. Degradation sacrifices quality to preserve availability.

**Checkpoint rollback.** Save intermediate state at critical workflow nodes. When subsequent steps fail, roll back to the most recent checkpoint and re-execute from a known-correct state. Suitable for workflows with many steps and high execution cost.

Which compensation strategy to choose depends on two factors: the recoverability of the failure and the business's error tolerance. Format failures can be recovered through retry; hallucination typically cannot be recovered through retry (external validation is needed). Critical business operations demand high reliability (prefer degradation to ensure availability); low-priority tasks can tolerate the latency of retries.

## Error Handling Anti-Patterns

**Ignoring semantic drift.** Checking only format, not semantics. If the output passes JSON Schema validation, it is deemed correct. This is a false sense of security.

**Infinite retry.** No maximum retry limit, or the limit is set too high. Semantic drift from the LLM will not self-correct through repeated retries -- if the third retry still fails, the tenth will almost certainly fail too.

**Using an LLM to validate an LLM.** Using another LLM call to validate the first LLM's output. This has value in certain scenarios (e.g., using a small model to quickly screen for obvious errors), but as a general strategy it is problematic -- it layers non-determinism on top of non-determinism.

**Silent degradation.** Degradation occurs but the user is not notified. The user thinks they received a high-quality LLM analysis when they actually got a rule-based template response. Users should know what they are getting.
