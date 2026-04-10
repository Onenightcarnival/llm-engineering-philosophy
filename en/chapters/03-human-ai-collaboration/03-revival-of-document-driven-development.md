---
originalLink: /chapters/03-人机协作的软件过程/03-文档驱动开发的复兴
---

# The Revival of Document-Driven Development

## The Historical Failure of Documentation

Documentation is the most neglected artifact in software engineering, and the root cause is structural: the cost of writing documentation is paid upfront, while the benefits are realized much later. The writer invests time; the reader gains efficiency -- and those two groups are usually not the same people. The predictable result of this incentive misalignment: under delivery pressure, documentation is always the first thing sacrificed.

LLMs have changed this game-theoretic structure. Documentation is no longer written solely for future human readers -- it is simultaneously context input for AI programming assistants. The writer now benefits immediately -- good documentation directly improves AI assistance quality, with returns realized on the spot. Documentation used to be a favor done for others; now it directly serves the writer's own interest.

## Dual Readers: Documentation's New Identity

Good technical documentation has always needed to serve human readers: clear conceptual explanations, well-layered structure, examples in the right places. In the LLM era, documentation has gained a second reader -- AI. The two readers' needs mostly overlap, but diverge in a few places.

**Overlapping needs.** High degree of structure, precise concept definitions, self-contained context -- these characteristics matter equally to humans and AI. A document that humans cannot understand is equally useless to AI.

**AI-specific needs.** Type annotations are supplementary information for humans but high-priority constraint signals for AI. When naming is imprecise, humans can guess the meaning from context; for AI, it directly impacts generation quality. Cross-file reference relationships can be mentally stitched together by human readers but need to be explicitly declared for AI.

The dual identity means: documentation written for the LLM era has, in essence, raised the bar for what counts as good documentation. Documents that were "comprehensible to humans but not precise enough" were acceptable in the past; in the LLM era, they become bottlenecks for AI assistance quality.

## Documentation Quality Determines AI Assistance Quality

This is a causal chain you can directly observe.

**Type annotations are the highest-density documentation.** `def query(q: str) -> Any` tells AI close to nothing -- the input is some kind of string, the output is anything. `def search_products(query: ProductQuery) -> SearchResult[Product]` tells AI something structural: the input has a definite schema, the output has a definite generic structure. The calling code, error handling, and test cases AI generates from the latter versus the former are in a completely different league.

[Chapter 4](../04-declarative-prompts-and-type-contracts/02-code-as-prompt.md) discusses the type system as contract, and here it gains an additional dimension: types are not just runtime contracts but also the most effective signal for AI to understand code intent. In the LLM era, the return on type annotations is far greater than before -- not only can humans read your intent, but AI can too.

**Docstrings are semantic-layer context.** Type annotations tell AI what the structure is; docstrings tell AI what the intent is. A function's type signature may be structurally correct, but if there is no docstring explaining the business meaning, AI lacks critical semantic information when generating code that calls that function.

**Project-level documentation is global constraint.** Comments and type annotations in individual files provide local context; project-level READMEs, architecture docs, and coding standards provide global context. With global context, AI-generated code automatically follows the project's conventions and design patterns; without it, AI falls back on generic programming common sense, producing code that may be technically correct but stylistically alien.

## CLAUDE.md: A New Form of Specification

Project-level guidance files like CLAUDE.md represent a new documentation form -- system specifications written for AI, distinct from traditional READMEs (project introductions for humans) and API docs (interface references for developers).

This project's CLAUDE.md is a textbook case. The types of information it contains:

- The project's positioning and boundaries (AI needs to know what the project is to make reasonable decisions)
- Writing style and technical preferences (AI needs to know what style of content to generate)
- File naming and structural conventions (AI needs to know where generated files go and how they should be named)
- Quality standards (AI needs to know what output is acceptable)

In traditional software projects, this information is typically tacit knowledge -- residing in team members' heads, transmitted through word of mouth and code reviews. CLAUDE.md forces this tacit knowledge to become explicit, and that is its real value. The beneficiaries of this externalization are not just AI but also new human team members -- writing down these unspoken rules helps any new member joining the team, whether human or AI.

This creates an interesting feedback loop: to help AI better understand the project, the team invests effort in writing CLAUDE.md; the writing process forces the team to articulate and formalize previously vague conventions; the formalized conventions improve collaboration efficiency among human members. AI is the catalyst, but the entire development process is the ultimate beneficiary.

## The Feedback Loop Between Documentation and AI Output

Documentation quality and AI assistance quality mutually reinforce each other, potentially forming either a virtuous or a vicious cycle.

**Virtuous cycle:** Good documentation produces good AI output; the time saved by good AI output can be invested in documentation maintenance; better documentation further improves AI output quality. Once this cycle is spinning, documentation transforms from a cost center into an asset with quantifiable ROI.

**Vicious cycle:** Poor documentation produces poor AI output; poor AI output forces developers to fix things manually; the time consumed by manual fixes crowds out documentation maintenance; documentation deteriorates further. This cycle is equally self-reinforcing.

Which direction the cycle takes depends on the initial investment. Early on, deliberate over-investment is needed; once the flywheel is turning, it becomes self-sustaining.

## Unsolved Problems

The revival of document-driven development rests on a premise: documentation maintenance costs will decrease in the LLM era. This is half right -- AI can assist with generating initial documentation drafts, detecting documentation-code drift, and auto-updating changelogs. But the most valuable parts of documentation -- the rationale behind design decisions, the context of trade-offs, the record of "why we did not do it that way" -- can still only be written by humans.

Another limitation is the staleness problem. Keeping documentation and code in sync is a classic engineering challenge, and LLMs have not truly solved it. AI can detect drift between documentation and code, but it cannot judge whether the documentation or the code should be changed -- that judgment still requires a human. The discipline demanded by document-driven development has shifted: not "whether to write documentation," but "how to keep documentation and code in sync."
