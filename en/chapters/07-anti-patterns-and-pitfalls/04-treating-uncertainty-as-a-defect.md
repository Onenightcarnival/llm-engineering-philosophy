---
originalLink: /chapters/07-反模式与陷阱/04-把不确定性当缺陷
---

# Treating Uncertainty as a Defect

## The Most Insidious Anti-Pattern

The anti-patterns discussed in the preceding articles all have clear external manifestations: concatenating strings, binding to a single model, ignoring cost, misusing model capabilities, over-relying on frameworks. They can be caught through code review or architecture audits.

The anti-pattern discussed here is different. It lives in the developer's mental model. It does not manifest as any single line of identifiably wrong code, but as a pervasive wrong tendency: treating the instability of LLM output as a defect that must be eliminated, then pouring massive engineering effort into trying to eliminate it.

The external symptoms of this tendency: prompts grow ever longer, rules pile ever higher, constraints tighten ever further, temperature is set to 0, retry logic becomes increasingly complex -- all in the name of making the model's output "stable," "predictable," "the same every time."

That goal is unrealistic.

## Uncertainty Is Inherent

Chapter 1 analyzed the nature of autoregressive generation in detail: at each step, the model chooses the next token based on a conditional probability distribution. Even with temperature set to 0 (greedy decoding), different hardware, different batch sizes, and different precision settings can still produce different outputs -- because the rounding behavior of floating-point arithmetic is not perfectly consistent across environments.

More fundamentally: even if you achieve fully deterministic output in one specific environment, what you get is merely "the highest-probability token sequence." Highest probability does not mean optimal. For many tasks, the diversity introduced by sampling is precisely the necessary condition for producing high-quality output.

An analogy from computational mathematics: probability is to the LLM what rounding error is to floating-point arithmetic. You cannot eliminate rounding error from floating-point computation -- it is an essential property of the IEEE 754 representation. What you can do is understand how errors propagate, design numerically stable algorithms, and perform error checks at critical points. Trying to eliminate rounding error itself is a misunderstanding of the nature of computation. Likewise, trying to eliminate the instability of LLM output itself is a misunderstanding of the nature of generative models.

## The Failure Mode of Infinite Constraint Stacking

When developers try to eliminate output instability by stacking more rules, they enter a vicious cycle.

Phase one: the model's output is found to be insufficiently "stable," so more rules are added to the prompt. "Must output in the following format," "must not include any additional information," "strictly follow the template below."

Phase two: more rules create new problems. Rules begin to conflict -- output that satisfies Rule A may violate Rule B. The model "struggles" between multiple constraints, and output quality actually declines. Chapter 1 discussed this phenomenon: instruction compliance rates decline as the number of instructions increases.

Phase three: to cope with the quality decline caused by rule conflicts, even more rules are added to handle the conflicts. The prompt balloons from 200 tokens to 2,000 tokens. Developers spend enormous time tuning prompt wording; every word change can trigger a butterfly effect.

Phase four: maintenance costs spiral out of control. A 2,000-token prompt becomes "legacy code you dare not touch" -- no one dares modify it because no one fully understands the rationale for each rule and the interactions between them. This is the same problem as the "big ball of mud" architecture in traditional software.

The root of this cycle is that the goal itself is wrong: trying to achieve deterministic control at the prompt level, when prompts were never capable of providing deterministic control.

## The Correct Approach: Handle Uncertainty at the Architectural Level

The core claim of Chapter 2 is: uncertainty is a constraint. That claim has its most direct engineering implications here.

The correct approach is to design a system architecture that can tolerate output variability.

**Structured output + validation.** Do not try to make the model produce a perfect result every time. Instead, define a structural specification for the output (using a Pydantic model or JSON Schema) and let a validator check whether the output meets the spec. Retry or fall back when it does not. This transforms the impossible task of "eliminating instability" into the deterministic problem of "detecting and handling non-conforming output."

```python
from pydantic import BaseModel, Field, ValidationError
from typing import Literal


class AnalysisResult(BaseModel):
    category: Literal["positive", "negative", "neutral"]
    confidence: float = Field(ge=0.0, le=1.0)
    key_phrases: list[str] = Field(min_length=1, max_length=5)


def robust_analyze(text: str, max_retries: int = 3) -> AnalysisResult | None:
    """Instead of demanding perfection from every output,
    handle imperfection at the architectural level.

    The model may output different key_phrases, confidence may fluctuate --
    these variations are acceptable as long as they fall within the legal
    range defined by the type constraints. What truly needs to be caught
    are structural errors: wrong format, missing fields, out-of-bound values.
    """
    for attempt in range(max_retries):
        raw_output = call_llm(text)
        try:
            return AnalysisResult.model_validate_json(raw_output)
        except ValidationError:
            continue  # Structurally non-conforming, retry
    return None  # Still failing after retries, trigger degradation logic
```

**Multiple sampling + aggregation.** For critical decisions, do not rely on a single output. Sample multiple times and aggregate the results. For classification tasks, take the majority vote; for numerical estimates, take the median; for generation tasks, use another model to select the best output. The larger the sample size, the more reliable the estimate -- this is a basic principle of statistics.

**Probabilistic output + deterministic post-processing.** The LLM generates a first draft; deterministic code handles validation and correction. Date format wrong? Fix it with a regular expression. Value outside a reasonable range? Clip it with rules. Referenced entity does not exist? Validate against the database. Deterministic post-processing is a sensible division of labor between two computational paradigms.

## Coexisting with Uncertainty

The root of this anti-pattern is not purely technical; there is also a psychological dimension.

Engineers coming from a deterministic programming background are accustomed to a world of "same input -> same output." `sort([3,1,2])` always returns `[1,2,3]`; it never returns `[1,3,2]` because of bad luck. This determinism is the bedrock of traditional software engineering -- the prerequisite for debugging, testing, and reasoning.

Facing an inherently probabilistic system, the first reaction is fear and rejection -- "it's unreliable," "it's uncontrollable," "it's untestable." These judgments apply the standards of deterministic systems, but those standards do not work for probabilistic ones.

The investment decision framework discussed in Chapter 2 offers an analogy here: volatility is an essential property of markets. Investors who try to eliminate volatility (frequent trading, excessive hedging, pursuing zero risk) typically achieve worse results than investors who accept volatility (holding quality assets, tolerating short-term fluctuations, focusing on long-term returns). The principle is the same: fighting a system's essential properties costs dearly.

In LLM engineering, rather than spending 80% of your effort trying to eliminate output instability (which can never fully succeed), spend 20% of your effort designing an architecture that tolerates output variability (deterministic, testable, maintainable), and invest the remaining effort in improving system quality on the dimensions that truly matter.

The key is recognizing where the bar should be set. The bar should not be "identical output every time" -- for a probabilistic system, that is the wrong goal. The bar is "every output falls within an acceptable range, and unacceptable outputs are reliably detected and handled." The latter is a correct and achievable goal.
