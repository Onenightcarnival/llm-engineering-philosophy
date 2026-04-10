---
originalLink: /chapters/08-终章/01-范式转换的历史节奏
---

# Historical Rhythms of Paradigm Shifts

## Every Time, the Same Story

The history of software engineering is a sequence of paradigm shifts. Every one followed the same path: the old paradigm exposed systemic inadequacy at some pressure point, the new paradigm germinated at the margins, endured a resistance phase where the mainstream denied it, then rapidly redefined the entire industry's understanding of "what good software is" at some tipping point.

Structured programming replaced the freedom of goto statements. Object-oriented programming redefined the basic unit of code organization. Agile methodology overturned the waterfall model's obsession with certainty. Microservice architecture deconstructed the monolith's assumption of wholeness. In each transition, what got redefined was not just technical practice but the "self-evident" default assumptions embedded in engineering culture.

Looking back across these transitions, three structural features recur.

First, what triggers a paradigm shift is complexity pressure that the old paradigm cannot handle. Structured programming did not replace goto because Dijkstra wrote a paper -- it was because programs had grown to a scale where humans could no longer manage control flow in an unstructured way. The rise of object-oriented programming was the same story -- the demands for code reuse and modularity had outgrown the carrying capacity of procedural programming, and the elegance of language design was merely a surface factor. The real driver is always pressure; technology is just the response to that pressure.

Second, what actually changes in each transition is the definition of "correctness." In the goto era, "it runs" was correct. After structured programming, "logically clear and traceable" became the standard for correctness. After object-oriented programming, "responsibilities properly separated" entered the scope of correctness. After agile, "able to respond to change" became one dimension of correctness. Each paradigm shift layered new meaning onto the word "correct," and old meanings did not disappear -- they sank to become default premises.

Third, the arguments of the resistance phase are cut from the same cloth. "Goto is the most flexible control flow" -- true, but flexibility was not the binding constraint in that context. "The waterfall model is more predictable" -- true, but that predictability rested on the assumption that requirements don't change, and that assumption had already broken down. The resistors' arguments are usually correct at the technical level but wrong at the strategic level. They give precise answers to questions that no longer matter.

## What Makes This Time Different

The paradigm shift brought by LLMs follows the same structure, but with one fundamental difference: for the first time, the core component of the system has gone from deterministic to probabilistic.

Every previous paradigm shift, no matter how dramatic, left one underlying assumption intact: given the same input, a program produces the same output. Structured programming, object-oriented, functional programming, microservices -- they changed how code was organized, where system boundaries were drawn, how teams collaborated, but never changed the foundation that "program behavior is deterministic." Even the eventual consistency introduced by distributed systems was temporary state inconsistency, not uncertainty in computation itself.

LLMs changed this premise. As argued in [Chapter 1](../01-epistemology/01-one-token-at-a-time.md), the essence of autoregressive generation is conditional sampling in probability space. The same input does not guarantee the same output, and different outputs may all be "reasonable." This is semantic-level uncertainty -- it cannot be dismissed as implementation-level noise.

This means the current paradigm shift cuts deeper than any before it. It changes the basic semantics of what a "program" is -- one layer deeper than changes in code organization.

## What the Resistance Phase Looks Like

Following historical patterns, we are currently in the resistance phase. The resistance manifests the same way as always: judging the products of the new paradigm by the standards of the old.

The most typical manifestation is trying to turn LLMs into deterministic functions. Setting temperature to 0, imposing extremely strict output constraints, adding layers of validation and retry logic -- the subtext of these practices is "uncertainty is a bug that needs to be eliminated." Chapter 2 argued that uncertainty is an essential property. Trying to eliminate it is like trying to stop markets from fluctuating -- the cost usually exceeds the benefit.

The same applies to quality assurance: using traditional software testing frameworks to measure the quality of LLM systems. Asserting exact matches, pursuing 100% regression pass rates, treating any output variation as a defect -- these standards are built on the determinism assumption and are not just inapplicable in probabilistic systems but actively misleading, steering toward wrong engineering decisions. The statistical testing methods discussed in [Chapter 6](../06-testing-evaluation-and-observability/00-overview.md) are precisely the replacement for these old standards.

A more subtle form: a variant of framework worship. Thinking about LLM application structure through the abstractions of LangChain or similar frameworks, rather than starting from the structure of the problem itself. Early object-oriented programming had a similar tendency -- modeling everything with inheritance hierarchies. The common error is mistaking the tool's abstractions for the problem's structure.

## What Will Be Redefined

If historical patterns hold, when the resistance phase ends and the new paradigm is broadly accepted, the following concepts will be redefined:

"Correctness" will expand from "output matches expectation exactly" to "output falls within an acceptable distribution." Deterministic correctness is an extreme case of probabilistic correctness -- the output distribution degenerates to a single point.

"Testing" will expand from "verifying deterministic behavior" to "verifying statistical properties." The test suite for an LLM system will look more like hypothesis testing than a list of assertions. This direction has already been explored in Chapter 6.

"Interface contracts" will expand from "type signatures" to "type signatures plus probabilistic behavioral specifications." The Pydantic models and JSON Schema discussed in [Chapter 4](../04-declarative-prompts-and-type-contracts/00-overview.md) are early forms of this direction -- they constrain the structure of outputs but do not yet constrain the distributional characteristics of outputs.

"Debugging" will shift from "tracing deterministic execution paths" to "analyzing anomalies in output distributions." A "bug" in an LLM system is not necessarily one wrong output -- it may be a shift in the output distribution.

All these redefinitions follow from the single fact that "the core component is probabilistic." When the foundational assumption changes, the conceptual system built on the old assumption must be reconstructed. This reconstruction may take a decade or longer, but the direction is certain -- because the pressure point is real, and this pattern has always held.

## What Will Not Change

But history also reveals another pattern: in every paradigm shift, certain deep principles not only survived but became more important under the new conditions.

Separation of concerns will not become obsolete. Whether components are deterministic or probabilistic, the comprehensibility of a system depends on clear responsibility boundaries.

Constraint propagation will not become obsolete. In fact, when the core component becomes probabilistic, the value of explicit constraints goes up -- because you can no longer rely on deterministic behavior to implicitly guarantee consistency of system state. The type system as a constraint tool, argued for in Chapter 4, will only grow in importance under the new paradigm.

"Strategy over Analysis" will not become obsolete. In an environment of higher uncertainty, the leverage of strategic judgment is greater, and the room for fine-tuning at the tactical level to compensate is smaller.

What changes requires learning. What endures requires commitment.
