---
originalLink: /chapters/01-认识论/01-一次一个token
---

# One Token at a Time

## Conditional Probability Decomposition

LLMs generate text one token at a time, where each token is chosen conditioned on all preceding tokens.

This is the fundamental property. At every step, the model asks: "Given everything written so far, which word comes next?" It computes a probability for every candidate in its vocabulary and selects one. Once selected, that token becomes part of the condition, influencing the next choice. The entire text "grows" word by word this way.

Two critical implications follow.

**Generation is sequential.** Early token choices constrain the probability distribution over all subsequent tokens. Once the first sentence commits to a direction, the rest of the generation is locked onto paths consistent with that direction. A small divergence at the beginning can, after enough steps, send the output completely off course.

**Generation is local.** The model decides only the next token at each step -- it has no global planning capability. If the final output exhibits coherent structure, it is because statistical regularities in the training data make "coherent structure" itself a high-probability token sequence.

What the model actually outputs is a probability distribution. The conversion from distribution to concrete token is determined by the sampling strategy. The same distribution under temperature=0 (greedy decoding -- always pick the highest-probability token) and temperature=1.0 (sample from the raw distribution) can produce entirely different token sequences. Sampling strategy should be locked down at system design time: structured data extraction calls for low temperature, creative writing for higher temperature, code generation for medium-low. Using the same strategy for every task is like a chef cooking every dish at the same heat.

## From Mechanism to Engineering Impact

The training process behind autoregressive generation boils down to: show the model massive amounts of text, and drill it on "predict the next word." This fact has concrete engineering consequences.

**LLMs confabulate.** When the model encounters a question not covered by its training data, it generates a statistically "plausible" answer -- perfect grammar and style, but potentially fabricated content. Because fabricated content and real content carry roughly the same probability in the model's eyes.

**Prompt sensitivity is inherent.** Since every generation step is conditioned on all preceding tokens, changes in prompt wording -- even when the meaning is identical -- alter the model's scoring distribution over candidates. "Please summarize the following text" and "Produce an abstract of the text below" are semantically equivalent, but as conditioning prefixes, they correspond to different statistical patterns in the training data. Semantic equivalence does not imply behavioral equivalence.

**Generation cannot simultaneously serve as evaluation.** Each step of autoregressive generation extends the existing sequence. Asking the model to negate its own earlier output within the same generation means asking it to overturn its own conditioning mid-chain. Generation and evaluation cannot happen in a single LLM call -- they must be separate calls.

**Every LLM call is a roll of the dice.** Multiple calls with the same prompt will produce different outputs. System design must accept this fact.

## The Cost of Natural Language Interfaces

LLMs pulled system interfaces back from formal languages to natural language. `get_user(id=42)` has zero ambiguity, but "extract the key information from the text" could be interpreted as named entities, core arguments, numerical data, or the passages most relevant to a query -- what "key" means depends entirely on the model's contextual inference at that moment.

Formal API contracts are explicit, verifiable, composable, and version-controllable. Natural language "contracts" are none of these. The meaning of a prompt depends on the model's statistical inference, with no way to automatically verify whether it was understood correctly. Concatenating two prompts does not yield the same effect as executing them separately and combining the results. The same prompt may produce different quality outputs across model versions.

The spread of natural language interfaces is irreversible -- they have dramatically lowered the barrier to using software systems. The right strategy is to accept natural language as the outer interface while relying on type systems and structured validation internally for precision. Fuzzy on the outside, precise on the inside.
