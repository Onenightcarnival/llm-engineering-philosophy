---
originalLink: /chapters/00-序章/01-不是又一本提示手册
---

# Not Another Prompt Handbook

## Introduction

The field of "LLM applications" is drowning in content. Tutorials, cheat sheets, framework docs, best-practice collections, awesome lists -- they all share one trait: they assume what the reader really wants is "tell me how to do it."

How to write a good prompt. How to build a RAG system. How to orchestrate workflows with LangChain. How to build an Agent.

These questions deserve answers, but they share the same blind spot: nobody stops to ask what adjustments software engineering itself needs when the core component of a software system shifts from a deterministic function to a probabilistic language model.

This book is about "how to think" first, then "how to do."

## What This Book Does

A systematic answer, from one person, to the question: "What should software engineering look like in the age of large language models?"

"One person" means this book expresses personal opinions -- with clear preferences, clear judgments, clear taste. The biases and limitations behind them are explicitly declared in the [Personal Stance](02-personal-stance.md), so readers can calibrate accordingly.

Specifically, this book attempts three things:

**Lay the epistemological foundation.** What is a large language model, really? Here we draw on computation theory and philosophy of language. What does autoregressive generation mean? Where is the fundamental difference between probabilistic output and deterministic functions? These seemingly abstract questions directly determine the direction of every engineering decision that follows. If you don't understand the nature of probabilistic output, you'll treat uncertainty as a bug to be fixed -- and that road has no end.

**Build a methodological framework.** On the epistemological foundation, derive a set of engineering methodologies for handling uncertainty. Human-AI collaboration (Chapter 3), declarative prompting and type contracts (Chapter 4), architecture and orchestration (Chapter 5), testing, evaluation, and observability (Chapter 6) -- each chapter centers on a core thesis.

**Transfer across disciplines.** The decision dilemmas in software engineering and the convergence problems in computational mathematics often share the same mathematical structure. Recognizing that structure is already useful. When you realize that prompt optimization and numerical iterative methods face the same class of convergence problems, decades of criteria and techniques from numerical analysis become directly applicable.

The starting point of this book: it assumes you already know what LLMs can do, and the question now is how to build reliable software systems around them. So the evolution of Transformers, comparisons of attention mechanisms, the technical details of RLHF -- these have dedicated papers and textbooks, and won't be repeated here. Likewise, few-shot arrangement tricks for prompts, how to call a specific framework's API, or "10 LLM Frameworks to Watch in 2025" lists -- not discussed. What this book cares about is where prompts belong in software engineering, why the design decisions behind frameworks are worth understanding, and what kind of decision framework you need when making technology choices.

## Why Now

The fundamental paradigm of software engineering is undergoing a rare structural shift, and the industry is far from understanding what it means.

For the past sixty years, software engineering has been built on an implicit assumption: program behavior is deterministic. Given the same input, a program produces the same output. Testing, debugging, formal verification -- the entire methodology rests on this foundation. Even when concurrency, distributed systems, and eventual consistency introduced "uncertainty," that was merely implementation complexity, not semantic uncertainty. A distributed database might return stale data at a given point in time, but it doesn't "invent" data.

Large language models break this assumption. An LLM is a probabilistic generator. The same input can produce different outputs, and different outputs can all be "reasonable." So at least the part of software engineering's sixty-year methodology that depends on the determinism assumption needs to be re-examined.

That re-examination has barely begun. The current state of the industry: a massive amount of practice is running ahead of theory, a massive number of frameworks are being adopted without clear methodological guidance, and a massive number of "best practices" are just rules of thumb inductively generalized from limited cases -- not derived from first principles.

This book attempts to reason from first principles.

## Book Structure

[Chapter 1](../01-epistemology/00-overview.md) and [Chapter 2](../02-uncertainty-and-decisions/00-overview.md) are the foundation: what large language models fundamentally are, and how to make engineering decisions under uncertainty. [Chapter 3](../03-human-ai-collaboration/00-overview.md) through [Chapter 6](../06-testing-evaluation-and-observability/00-overview.md) apply the methodology to specific domains: working practices, declarative constraints, architecture and orchestration, testing and observability. [Chapter 7](../07-anti-patterns-and-pitfalls/00-overview.md) is the counter-examples. [Chapter 8](../08-epilogue/00-overview.md) returns to the philosophical level.

The starting point is a factual judgment (LLMs have changed the fundamental nature of software systems). The endpoint is a value judgment (in what direction should software engineering evolve).

## Reading Suggestions

If you're an experienced software engineer just starting with LLM application development, start with Chapters 1 and 2. After absorbing the epistemological and methodological framework in those two chapters, you'll look at the technical details that follow with different eyes.

If you're already building LLM applications and hitting concrete problems -- "prompts are unstable," "the system is unreliable," "I don't know how to test this" -- you can jump straight to the relevant chapter, but consider going back to read the first two. Many engineering problems are rooted not in the technical layer but in the cognitive layer.

If you're more interested in frameworks and tools, this book will probably make you uncomfortable. It keeps asking "why" instead of just telling you "how." That's deliberate: tools expire, ways of thinking don't.

Regardless of your entry point, the goal of this book is not to hand you a checklist to memorize, but to help you build the ability to reason forward from first principles. The LLM field spawns a batch of new concepts every few months -- new architecture patterns, new orchestration paradigms, new evaluation methods. If your knowledge structure is held together by concepts and tools, every update forces you to start over. But if you understand the fundamental impact of probabilistic output on engineering methodology, if you understand the basic principles of declarative constraints and decision-making under uncertainty, then faced with any new concept, you can judge for yourself: is this a genuine innovation on the underlying structure, or just a terminology refresh of an existing idea.

Disagreeing with the judgments in this book is perfectly normal. In fact, if you agree with the author on every point, this book has limited value for you -- it hasn't given you a new perspective. A valuable reading experience is one where some parts resonate deeply, some parts provoke strong disagreement, and the process of disagreeing itself forces you to clarify your own position.
