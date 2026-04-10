---
originalLink: /chapters/03-人机协作的软件过程/04-知识库作为活的系统规格说明
---

# Knowledge Bases as Living System Specifications

## The Fundamental Flaw of Static Documentation

The fundamental problem with traditional technical documentation is that it is dead. The moment it is written, it starts going stale. The system evolves but the documentation does not keep up; requirements change but the documentation is still stuck on the previous version; the team turns over and new members have no idea which documents are outdated.

The problem is structural. Static documentation has no hard linkage to the system it describes -- documentation is documentation, code is code, and the two drift apart on their own paths of decay. Relying solely on human discipline to maintain consistency between documentation and code will, given enough time, inevitably fail.

A knowledge base as a living system specification is an attempt to solve this structural problem. The idea is that technical knowledge should be organized in a way that simultaneously serves human comprehension and AI consumption. When a knowledge base truly achieves this, it becomes part of the system specification.

## The Leap from Description to Specification

"Description" and "specification" are fundamentally different things.

A description comes from observation: it tells the reader what the system currently looks like. Descriptions can be vague, outdated, or incomplete, and the reader must judge for themselves how reliable they are.

A specification is normative: it declares what the system should look like. A specification is verifiable -- when system behavior is inconsistent with the specification, either the system has a bug or the specification needs updating.

Traditional documentation is description. It has no binding force and does not participate in system execution. But when CLAUDE.md states "do not use emoji," AI will follow this rule when generating content. This rule is no longer just a suggestion -- through AI's execution, it becomes a binding specification. The moment knowledge base content is read by AI as context, it becomes specification.

This transformation is not automatic. A vague, ambiguous description will not produce deterministic behavioral constraints even when read by AI. Only knowledge base content that is structurally clear, semantically precise, and has well-defined boundaries can effectively function as specification. In other words, every piece of content in the knowledge base could potentially become a prompt fragment in some AI interaction, so both its precision and maintainability should be held to prompt-level standards.

## Structural Requirements for Dual Readers

A knowledge base that simultaneously serves human comprehension and AI consumption has specific structural requirements for content organization.

**Self-containment.** Each article should be reasonably self-contained -- readers (whether human or AI) should not need to open ten links to understand a single concept. This does not mean avoiding references, but rather that referenced content should be an entry point for "going deeper," and readers should be able to understand the current paragraph without following the link. For AI, self-containment directly determines how effectively the context window is used: a self-contained article can be consumed as a standalone context unit, while an article riddled with external dependencies requires recursively loading large amounts of related content.

**Hierarchical structure.** Knowledge base content should have clear hierarchy: chapter level provides a global map, article level provides complete arguments, paragraph level provides specific claims. This hierarchy serves as a navigation aid for humans and a retrieval index for AI. A flat knowledge base (all content laid out at the same level) is passable for human readers but severely degrades AI retrieval precision.

**Explicit concept relationships.** Human readers can implicitly infer relationships between concepts through reading experience and domain knowledge. AI depends on explicit reference chains. When an article mentions "constraint propagation," it should explicitly link to the definition in [Chapter 4](../04-declarative-prompts-and-type-contracts/00-overview.md), rather than assuming the reader already knows the concept. Explicit references are a convenience for human readers; for AI, they are a necessity.

**Stable terminology.** When the same concept uses different names in different articles, human readers can still figure it out from context, but AI may treat them as two distinct concepts. A unified terminology system is a prerequisite for a knowledge base to function as specification.

## This Project as a Self-Referential Case

This project -- a technical work on best practices for LLM application development -- is itself an instance of a knowledge base serving as a living system specification.

CLAUDE.md declares the project's positioning, writing style, technical preferences, and collaboration norms. Every time AI collaborates on this project, it loads these declarations as context, directly shaping the style, structure, and quality of generated content. The technical preference "prefer declarative over imperative" does not need to be restated in every article; AI will automatically follow it when generating code examples.

The chapter structure itself reflects dual-reader considerations. The progression from epistemology to methodology provides a logical thread for human readers; for AI, it is a semantic map -- when asked about testing, AI knows to look in Chapter 6; when asked about architecture, AI knows to look in Chapter 5. A stable structure also makes AI retrieval and citation more accurate.

Each article follows a consistent pattern -- claim statement, argument development, code examples (where applicable), limitations discussion. This pattern is a rhythm guarantee for human readers and a reliable parsing template for AI. AI can anticipate the structure of each article, enabling it to extract and cite specific information more effectively.

## Maintaining a Living Specification

The essential difference between a knowledge base and static documentation is the word "living" -- it evolves as understanding deepens and practice accumulates. But evolution must be controlled; otherwise the knowledge base degrades into a pile of mutually contradictory essays.

Key mechanisms for controlled evolution:

**Backward-compatible concept evolution.** When a concept's definition needs updating, the update should not invalidate other articles that reference it. This is the same principle as backward compatibility in APIs -- concepts can be extended, refined, and supplemented, but existing reference relationships should remain valid.

**Traceability of changes.** Version control records not only "what changed" but should also record "why it changed" through commit messages. When AI uses knowledge base content, the rationale behind a change matters more than the change itself -- rationale provides decision context, and only after AI understands the intent can it handle situations that literal rules do not cover.

**Internal consistency checks.** Beyond a certain scale, maintaining internal consistency by hand becomes infeasible. AI can actually contribute here: detecting whether terminology usage is consistent, whether reference targets exist, whether claims in different articles contradict each other. There is something pleasantly recursive about this -- AI uses the knowledge base to do its work while simultaneously helping check the knowledge base's own quality.

## How Should Technical Knowledge Be Organized

The idea of knowledge bases as living system specifications has significance beyond individual projects. Behind it lies a larger question: how should technical knowledge be organized in the LLM era?

Traditional knowledge organization paradigms -- textbooks, documentation sites, wikis -- were all designed for human readers. They assume the reader is human, so they allow metaphor, elision, leaps of logic, relying on the reader to infer and fill in the gaps. These assumptions no longer hold when AI is the reader.

But the reverse -- knowledge organization purely optimized for AI, fully structured, fully formalized, stripped of all implicit information -- would be unreadable for humans. Nobody wants to read a technical book that looks like a database schema.

The way out is to find the intersection: a knowledge organization approach that is friendly to both humans and AI. This project's CLAUDE.md contains a sentence that captures this stance precisely: "If a document cannot remain clear for both humans and machines, the problem lies in the structure itself." This is a quality criterion that is actionable in practice.

## The Tension

For a knowledge base to serve as a system specification, there is an inherent contradiction: specifications demand precision and stability; knowledge bases demand openness and evolution. Over-pursuing precision leads to rigidity; over-pursuing openness erodes binding force. There is no once-and-for-all answer to this balance.

Another limitation is scale. As a personal project, this knowledge base's size and complexity are manageable. When a knowledge base scales to the team or organization level, the costs of maintaining consistency, managing concept evolution, and coordinating multi-author contributions rise sharply. Knowledge base governance -- who has the authority to modify core definitions, how conceptual conflicts are arbitrated, how outdated content is retired -- becomes the dominant concern at scale. These are fundamentally organizational problems and are not explored further here.
