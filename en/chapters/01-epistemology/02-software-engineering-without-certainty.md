---
originalLink: /chapters/01-认识论/02-没有确定性的软件工程
---

# Software Engineering Without Certainty

## Sixty Years of Implicit Assumptions

Software engineering has carried one assumption since its inception: program behavior is deterministic.

This assumption is so foundational that it is rarely examined as an assumption at all. Testing methodology assumes it: given the same input, a program should produce the same output -- otherwise it is a bug. Debugging methodology assumes it: bugs are reproducible. Formal verification assumes it: program behavior can be guaranteed by mathematical proof. Version control assumes it: if behavior changed, it is because the code changed.

Even the introduction of concurrency and distributed systems did not break this assumption. The nondeterminism of concurrency is at the scheduling level -- each thread internally remains deterministic. The "nondeterminism" of distributed systems is information delay -- a database will not "create" a record you never wrote.

What LLMs break is semantic-level determinism. Two calls with the same prompt may return different content, and both different outputs may be "correct."

## Four Levels of Probabilistic Behavior

Nondeterminism comes in several flavors.

**Token level.** An inherent property of autoregressive generation: each step is a sampling event. Setting temperature=0 nearly eliminates it, at the cost of generation diversity.

**Semantic level.** Even under greedy decoding, different prompt wordings can still lead to different output semantics. The mapping from prompt to semantics is many-to-many.

**Model level.** Model providers can update weights, adjust inference parameters, or modify safety filters without notice. Your code has not changed a single line, but system behavior may already be different.

**System level.** When multiple LLM calls are chained, the probabilistic nature of each step compounds. A single step at 95% reliability drops to 77% over five steps and 60% over ten. This is a hard limit dictated by mathematics -- "write better prompts" cannot work around it. When you see a 10-step workflow, the first question should not be how to optimize each step, but whether you can reduce it to 3.

## What Broke, What Matters More

Once the deterministic assumption is gone, some engineering principles break and others become more important.

What broke: The `assert f(x) == expected` pattern -- there is no single correct output for an LLM, so testing must shift from asserting equality to asserting properties. "Bugs are reproducible" -- in a probabilistic system, the same input may not reproduce the same output. "If the code hasn't changed, behavior shouldn't change" -- the LLM is an external dependency, and ensuring system correctness requires continuous monitoring.

What matters more: Type systems are the last bastion of determinism -- the structure of output can be enforced, even when content remains probabilistic. Design by contract becomes more critical at boundaries, because when system internals are unpredictable, preconditions, postconditions, and invariants are the only remaining guarantees. Observability is indispensable -- problems may not be reproducible, so you must capture enough information at the moment they occur. Defensive programming, likewise: validate the output of every LLM call before passing it downstream, just as you would never splice user input directly into a SQL query.

## Capability Boundaries

Knowing what LLMs are bad at matters more than knowing what they can do -- and these weaknesses are dictated by mechanism, not cured by model upgrades.

**Precise computation.** Models generate statistically "plausible" token sequences. Precise computation demands 100% accuracy -- close is not good enough. Let the LLM handle intent parsing; let deterministic code handle the actual calculation.

**State maintenance.** Each call is independent. The "memory" of a context window is essentially treating history as a conditioning prefix -- capacity is limited, there is no way to selectively remember important information, and there are no side effects. State management must be explicit, external, and deterministic.

**Consistency.** Ask the same question twice and you may get different answers. Two logically equivalent phrasings may yield contradictory answers. The first half and second half of a single long output may contradict each other. Deterministic systems come with built-in consistency guarantees; probabilistic systems require explicit checking and enforcement.

**Faithful instruction following.** A prompt is a condition. The model's compliance with instructions is probabilistic, and negative instructions are especially unreliable -- "do not do X" at the token level actually activates probabilities associated with X, potentially increasing the chance of generating X. The more instructions and the more complex they are, the lower the compliance rate.

**Self-assessment.** When the model says "I'm confident," that is merely a high-probability continuation. Reliable quality assessment requires external means.

These boundaries point to a division of labor: LLMs handle intent understanding and natural language generation; deterministic code handles computation, state, and consistency. The two are connected by typed contract interfaces. What is fuzzy belongs to the LLM; what must be precise belongs to code.
