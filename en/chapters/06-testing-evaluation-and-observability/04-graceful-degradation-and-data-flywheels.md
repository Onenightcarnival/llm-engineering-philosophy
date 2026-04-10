---
originalLink: /chapters/06-测试评估与可观测性/04-降级设计与数据飞轮
---

# Graceful Degradation and Data Flywheels

## Degradation Is Part of Normal Operation

In traditional software, degradation usually means something has gone wrong -- the database connection pool is exhausted, a third-party service is unavailable, memory is running out. Degradation is an emergency measure for abnormal conditions.

In LLM applications, degradation is part of normal operation. LLM calls may require degraded handling due to rate limits, timeouts, format errors, or semantic drift. In a probabilistic system, these are all routine. Design degradation as an official system capability, not an afterthought patch -- this is a critical insight for LLM application reliability.

## Degradation Tiers

Degradation is not all-or-nothing; there are multiple levels in between. Design multiple degradation tiers so the system can still provide some level of service under varying degrees of failure.

| Tier | Strategy | Quality | Cost | Applicable Scenario |
|------|----------|---------|------|-------------------|
| Full capability | Strongest model, full context, complex reasoning chain | Highest | Highest | Normal operation |
| Simplified reasoning | Smaller model, shorter context, simpler prompt | Moderate | Lower | Latency-sensitive or cost-constrained |
| Cache | Return previously computed results, zero LLM calls | Potentially stale | Zero | Common requests, output does not need real-time updates |
| Rules | Predefined rules and templates, no LLM usage at all | Rigid but reliable | Zero | Scenarios coverable by templates |
| Fallback | Generic "cannot process" response, guide user to human support | Lowest | Zero | All other options have failed |

The execution logic tries from the highest tier down, falling back one level on failure. Every tier's response should carry a service level identifier (the user needs to know the current service level).

## Degradation Trigger Conditions

When should the system drop from a higher tier to a lower one? Trigger conditions should be explicit and quantifiable.

**Latency trigger.** If an LLM call has not returned within N seconds, switch to a faster alternative. For user-facing applications, 3-5 seconds is the typical tolerance ceiling.

**Cost trigger.** If a single request's token consumption exceeds the budget, switch to a more economical alternative. This prevents complex requests (very long context, multi-turn reasoning) from causing cost blowouts.

**Quality trigger.** If the LLM output fails validation (structural validation failure, confidence too low), try degrading to a more reliable alternative.

**Circuit breaker trigger.** If the failure rate exceeds a threshold within a time window, temporarily skip LLM calls and go directly to degraded alternatives. Same as the traditional circuit breaker pattern -- give the overloaded LLM service room to breathe.

## Transparency

The most important design principle for degradation is transparency. Users should know whether they are receiving full service or degraded service.

Opaque degradation is a form of deception -- users think they are getting an AI-analyzed result, but they are actually getting a rule-based template response. This deception may be imperceptible to users in the short term, but it erodes trust over the long term.

Transparency can be implemented simply: attach a service level identifier to the response, use distinct visual cues in the UI to differentiate full service from degraded service, and annotate degradation information in the API response metadata.

## Degradation vs. Retry

Degradation and retry solve different problems. Retry assumes "trying again might succeed" -- appropriate for transient faults (network jitter, briefly hitting a rate limit). Degradation assumes "high-quality results are not achievable under current conditions" -- appropriate for persistent problems (the model performs poorly on this input type, context exceeds processing capacity).

The decision criterion: if the failure cause is random (network issues, occasional API timeouts), retry; if the failure cause is systematic (the input type exceeds the model's capability, a prompt design flaw), degrade. Retry addresses accidental problems; degradation addresses structural ones.

The two can be combined: retry 1-2 times first, then degrade if still failing. But do not retry indefinitely before degrading -- users will not wait. Set an explicit retry budget (time or count), and degrade immediately when the budget is exhausted.

## Data Flywheel: From Degradation Data to Quality Improvement

Degradation is not just a defense line; it is also a data source. All data generated during system operation -- normal outputs, degradation events, user feedback -- if collected and leveraged properly, can form a positive feedback loop: the system's output data, after collection, evaluation, and filtering, becomes input for improving the system. The more it is used, the more data there is, and the better the system gets.

Whether this loop actually spins depends on whether information flows smoothly between each step -- garbage in, garbage out.

**Quality tiers of feedback signals.** Not all user behaviors constitute equivalent feedback signals. The crudest are implicit signals -- completion rate, copy rate, session abandonment rate. These are free to collect but extremely noisy; they only become statistically meaningful in large volumes. One tier up is explicit feedback -- ratings, downvotes, regeneration requests. Much better signal-to-noise ratio, but users tend to provide feedback only when dissatisfied, so the data skews negative. The highest information density comes from structured annotation -- scoring along quality dimensions -- but annotation cost is also the highest. The practical strategy is to use them in tiers: implicit signals for coarse filtering, explicit feedback for confirmation, structured annotation for diagnosis.

**Cold start.** The positive feedback loop has a startup threshold -- initially there is no user data, so you cannot assess quality or identify improvement directions. Three strategies to break through: synthetic data bootstrapping (use the model itself or a stronger model to generate test data, phasing it out as real data accumulates); small-scale high-quality annotation (50 precisely annotated samples may have more diagnostic value than 5,000 implicit signals); internal dogfooding (team members serve the dual role of users and evaluators).

**Indicators of acceleration and stagnation.** Starting the loop does not guarantee it will accelerate. Signs of acceleration: quality metrics improve continuously as data volume grows, the proportion of high-quality samples in new data is rising. Signs of stagnation: quality metrics no longer improve with data growth -- either the information content of feedback signals has been fully exploited, or the improvement strategy has hit a ceiling (prompt optimization has converged, and the next step requires fine-tuning or architectural changes). Signs of reversal: quality metrics deteriorate, most commonly because of distribution shift in feedback data -- early users and later users have different usage patterns.

The feedback loop naturally biases toward "pleasing the majority" -- improvement direction is driven by majority patterns in the data, and minority use cases that may be equally important are easily neglected.
