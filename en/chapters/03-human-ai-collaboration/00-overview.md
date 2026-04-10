---
originalLink: /chapters/03-人机协作的软件过程/00-概述
---

# Chapter 3 Human-AI Collaborative Development

LLMs are not just the thing being built -- they are participants in the building process. This changes the workflow and division of labor in software development.

This chapter comes before the technical details (prompt engineering, type systems, architecture patterns) because the shift in how we work is the prerequisite for all technical practices. Readers need to understand that writing code, doing code reviews, and maintaining documentation have already changed, before they learn about declarative prompts and RAG architectures.

## Articles

- [AI-Assisted Programming Done Right](01-ai-assisted-programming-done-right.md) -- It is not as simple as "AI writes code, humans review." A more accurate model: humans define structure and constraints, AI fills in the implementation; humans own the "what" and "why," AI owns the "how."
- [Human-AI Division of Labor in Code Review](02-human-ai-division-in-code-review.md) -- AI excels at catching pattern-level issues (style inconsistencies, common bug patterns); humans excel at judging the soundness of design decisions. How to design a review process that leverages the strengths of both.
- [The Revival of Document-Driven Development in the LLM Era](03-revival-of-document-driven-development.md) -- Documentation used to be the most neglected part of software engineering. In the LLM era, documentation is no longer written only for humans -- it is also context for LLMs. READMEs, comments, and type annotations have become "part of the prompt." This insight motivates the type system discussion in [Chapter 4](../04-declarative-prompts-and-type-contracts/00-overview.md): documentation is a specification written for the dual audience of humans and machines, and Pydantic models are the formalized expression of that specification.
- [Knowledge Bases as Living System Specifications](04-knowledge-bases-as-living-specs.md) -- This project itself is an example. A well-organized knowledge base serves simultaneously as a technical work for human readers and as a system specification for LLMs. How this dual identity shapes the way content is organized.
