---
originalLink: /chapters/08-终章/02-规格说明的回归
---

# The Return of Specifications

## An Abandoned Ideal

There is a road in the history of software engineering that was abandoned: formal specifications.

From the 1970s through the 1990s, a group of brilliant computer scientists -- Dijkstra, Hoare, Lamport -- tried to solve the software correctness problem at its root. Their approach: first describe precisely what a program should do using mathematical language (the specification), then prove that the implementation satisfies that specification (formal verification). Z notation, VDM, the B method, TLA+ -- these formal methods had deep influence in academia but were almost never widely adopted in industry.

The reason for failure was economics. The cost of translating intent into formal specifications was too high; keeping specifications synchronized with implementation was even higher. For most software projects, the time spent writing specifications was enough to write the code twice over. So industry chose a more pragmatic path: write the implementation directly, approximate correctness verification through testing, approximate quality assurance through code review.

Formal methods retreated to aerospace, nuclear control systems, chip verification -- domains where the cost of failure is extreme. In everyday software development, the concept of "specification" degenerated into product requirements documents and API documentation -- informal, decoupled from implementation, and usually outdated natural language descriptions.

The lesson from this history: when translation cost exceeds the cost of direct implementation, specifications are not economical. That equation is about to be rewritten by LLMs.

## The Dramatic Reduction in Translation Cost

One of the core capabilities of LLMs is translating one form of representation into another. When this translation ability is strong enough, the translation cost from "specification to implementation" drops from person-months to seconds.

The very reason that caused formal methods to fail is disappearing. Specifications were uneconomical in industry because they required humans to perform the translation. Humans wrote specifications, humans read specifications, humans translated specifications into implementation code. Every step was expensive and error-prone. If machines can perform the translation near-instantaneously, then the only thing developers need to do is write sufficiently precise specifications.

Today's LLM-assisted programming tools are already doing the primitive version of this: developers describe intent, models generate implementation. The difference is that current "intent descriptions" are mostly informal natural language, and the generated implementations require extensive human review and correction. But the direction is clear -- as model capabilities improve and specification tooling matures, the path from precise specification to reliable implementation will keep getting shorter.

## The Primitive Specification Language

The early form of this trend has appeared in an unexpected place: CLAUDE.md and similar project-level guidance files.

This project's own CLAUDE.md is an example. It describes the project's positioning, writing principles, technical preferences, file naming conventions, quality standards -- all of these are specifications. It tells the executor (whether human or model) "what to do" and "what the result should look like."

These files are a primitive, informal specification language. Their limitations are obvious: the ambiguity of natural language leaves too much room for interpretation, they lack machine-verifiable precision, and there is no way to automatically check whether the implementation satisfies the specification. But the direction is right -- the developer's focus has shifted from "how to implement" to "how to describe intent."

The "Code as Prompt" principle argued in [Chapter 4](../04-declarative-prompts-and-type-contracts/00-overview.md) is essentially one step further along the same direction. When Pydantic models are used as the carrier for prompts, type annotations are structural specifications, Field descriptions are semantic specifications, and validators are invariant specifications. This is essentially "using the formalization power of code to write specifications." [Chapter 4](../04-declarative-prompts-and-type-contracts/00-overview.md) systematized this idea, arguing for a complete framework of type systems as a specification language.

From CLAUDE.md to Pydantic models to JSON Schema, the degree of formalization increases step by step. At one end is completely informal natural language description; at the other is fully formalized type definitions. Current practice mostly occupies the middle ground -- semi-formal specifications mixing natural language with structured constraints. This middle ground is not the end state, but the direction of evolution is visible.

## The Logical End of Declarative

Follow this direction to its conclusion, and the return of specifications leads to the extreme of declarative programming: developers only describe "what they want," and implementation is entirely machine-generated.

There is precedent for this. SQL is a domain-specific specification language -- you describe the properties of the data set you want, and the query optimizer decides how to retrieve it. React's declarative UI follows the same pattern -- you describe what the interface should look like given a certain state, and the framework decides how to update the DOM. Every successful instance of "describe intent, automate implementation" is a validation of the specification idea in a specific domain.

What LLMs offer is the possibility of extending this pattern from specific domains to general programming. Not every domain needs a purpose-built declarative language -- a sufficiently powerful translator can convert specifications directly into implementations in any domain.

But there is a critical epistemological issue here: the precision requirement for specifications actually goes up.

When human programmers write implementation code, the code itself is the most precise specification -- precise down to every execution step. When developers shift to writing specifications rather than implementations, any ambiguity in the specification may be filled in by the LLM in unpredictable ways. The ambiguity problem of natural language interfaces discussed in [Chapter 1](../01-epistemology/01-one-token-at-a-time.md) becomes even more pronounced here.

This means "writing specifications" is not an easier task than "writing code." Quite the opposite -- it demands a different and possibly scarcer capability: precisely describing intent, constraints, and quality standards without touching implementation details.

## From Writing Code to Writing Specifications

This shift has profound implications for the capability structure of software engineers.

Traditional programming ability is essentially translation ability: translating human intent into machine instructions. Knowledge of algorithms, mastery of language features, familiarity with APIs -- these are all determinants of translation efficiency. When translation can be performed by LLMs, the scarcity of these capabilities declines.

What matters more is the ability to write specifications: precisely defining the boundaries of the problem space, identifying and expressing constraints, making grounded choices among multiple viable approaches, and judging whether an implementation satisfies the specification. These capabilities align closely with the decision framework discussed in [Chapter 2](../02-uncertainty-and-decisions/00-overview.md) -- because a specification is essentially the formalized expression of a series of decisions.

The founders of formal methods saw this direction forty years ago. Their mistake was underestimating the rigidity of translation cost as a constraint. Now, LLMs are weakening that constraint. The abandoned road is passable again -- this time more pragmatically: sufficiently precise specifications, plus a sufficiently powerful probabilistic translator, plus sufficiently reliable verification mechanisms.

Formal thinking has regained practical value under the new conditions. The ability to precisely describe intent is transforming from an academic exercise into a fundamental engineering skill in the LLM era.
