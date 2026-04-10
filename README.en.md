[中文](README.md) | English

# LLM Engineering Philosophy

> **Note:** This is a translation of the original Chinese work. The translation may contain inaccuracies. When in doubt, please refer to the [original Chinese version](README.md).

The LLM application space is being flooded with "how-to" content — tutorials, cheat sheets, framework docs, awesome lists. They share a blind spot: no one steps back to ask what adjustments software engineering itself needs when a system's core component shifts from deterministic functions to probabilistic language models.

This book focuses on "how to think" before "how to do." It is not a prompt cookbook, not a framework guide, not a model benchmark report. It is one person's systematic answer to "what should software engineering look like in the age of LLMs." With clear preferences, clear judgments, and clear taste.

---

## Sample Reading

The following is excerpted from Chapter 7, "Treating Uncertainty as a Defect." If you are working on LLM application development, see if this scenario looks familiar:

> When developers try to eliminate output instability by stacking more rules, they enter a vicious cycle.
>
> Phase 1: The model's output isn't "stable" enough, so more rules are added to the prompt. "Must follow this exact format," "must not include any extra information," "strictly follow this template."
>
> Phase 2: More rules create new problems. Rules conflict with each other — output satisfying Rule A may violate Rule B. The model "struggles" between multiple constraints, and output quality actually decreases.
>
> Phase 3: To address the quality decline caused by rule conflicts, even more rules are added to handle the conflicts. The prompt balloons from 200 tokens to 2,000 tokens. Developers spend enormous time tweaking prompt wording, where every word change can trigger a butterfly effect.
>
> Phase 4: Maintenance costs spiral out of control. A 2,000-token prompt becomes "legacy code you can't touch" — no one dares modify it because no one fully understands the rationale behind each rule or how they interact.

The root cause of this cycle is that the goal itself is wrong: trying to achieve deterministic control at the prompt level, when prompts simply cannot provide deterministic control. The book discusses the correct alternative approaches.

---

## Articles Worth Reading First

[Treating Uncertainty as a Defect](https://onenightcarnival.github.io/llm-engineering-philosophy/en/chapters/07-anti-patterns-and-pitfalls/04-treating-uncertainty-as-a-defect) -- Prompts getting longer, constraints piling up, temperature set to 0, retry logic growing ever more complex — if you're doing these things, you may be fighting against the fundamental nature of LLMs.

[Over-Engineering Orchestration Frameworks](https://onenightcarnival.github.io/llm-engineering-philosophy/en/chapters/05-architecture-and-orchestration/06-over-engineering-orchestration-frameworks) -- What 15 lines of code could accomplish, a framework does with seven layers of abstraction. That's not engineering — it's ceremony.

[AI-Assisted Programming Done Right](https://onenightcarnival.github.io/llm-engineering-philosophy/en/chapters/03-human-ai-collaboration/01-ai-assisted-programming-done-right) -- "AI writes code, humans review" — this model is fundamentally wrong. Effective human-AI collaboration is layered control, not assembly-line quality inspection.

[Schema as Workflow](https://onenightcarnival.github.io/llm-engineering-philosophy/en/chapters/04-declarative-prompts-and-type-contracts/03-schema-as-workflow) -- The field ordering in a schema defines the LLM's reasoning path. Each field carries one reasoning step; field-level single responsibility is the prerequisite for declarative chain-of-thought.

---

## Table of Contents

### Preface: Why This Book

Not another prompt handbook. Positioning and boundary statement.

- [Overview](en/chapters/00-preface/00-overview.md)
- [Not Another Prompt Handbook](en/chapters/00-preface/01-not-another-prompt-handbook.md)
- [Personal Stance](en/chapters/00-preface/02-personal-stance.md)

### Chapter 1 Epistemology: The Nature and Limits of LLMs

Understanding what LLMs really are from the perspective of computation theory and philosophy of language. The philosophical foundation of the book.

- [Overview](en/chapters/01-epistemology/00-overview.md)
- [One Token at a Time](en/chapters/01-epistemology/01-one-token-at-a-time.md)
- [Software Engineering Without Certainty](en/chapters/01-epistemology/02-software-engineering-without-certainty.md)

### Chapter 2 Uncertainty and Decision-Making

Engineering decision frameworks under uncertainty. Strategy over analysis. The methodological foundation of the book.

- [Overview](en/chapters/02-uncertainty-and-decisions/00-overview.md)
- [Strategy Over Analysis](en/chapters/02-uncertainty-and-decisions/01-strategy-over-analysis.md)
- [The Constraint Structure of Uncertainty](en/chapters/02-uncertainty-and-decisions/02-constraint-structure-of-uncertainty.md)

### Chapter 3 Human-AI Collaborative Development

Restructuring development methodology. AI-assisted programming, human-AI division of labor, the revival of document-driven development, knowledge bases as living specs. Changes in how we work precede technical details.

- [Overview](en/chapters/03-human-ai-collaboration/00-overview.md)
- [AI-Assisted Programming Done Right](en/chapters/03-human-ai-collaboration/01-ai-assisted-programming-done-right.md)
- [Human-AI Division of Labor in Code Review](en/chapters/03-human-ai-collaboration/02-human-ai-division-in-code-review.md)
- [The Revival of Document-Driven Development](en/chapters/03-human-ai-collaboration/03-revival-of-document-driven-development.md)
- [Knowledge Bases as Living System Specifications](en/chapters/03-human-ai-collaboration/04-knowledge-bases-as-living-specs.md)

### Chapter 4 Declarative Prompts and Type Contracts

The paradigm leap from imperative to declarative, centered on two core concepts for declarative chain-of-thought: Code as Prompt and Schema as Workflow.

- [Overview](en/chapters/04-declarative-prompts-and-type-contracts/00-overview.md)
- [From Imperative to Declarative](en/chapters/04-declarative-prompts-and-type-contracts/01-from-imperative-to-declarative.md)
- [Code as Prompt](en/chapters/04-declarative-prompts-and-type-contracts/02-code-as-prompt.md)
- [Schema as Workflow](en/chapters/04-declarative-prompts-and-type-contracts/03-schema-as-workflow.md)

### Chapter 5 Architecture and Orchestration

Structural design and dynamic execution of LLM applications. The essence of RAG, structural decomposition of agents, glue layers vs core engines, implicit vs explicit orchestration, error propagation, orchestration framework critique.

- [Overview](en/chapters/05-architecture-and-orchestration/00-overview.md)
- [The Essence of RAG](en/chapters/05-architecture-and-orchestration/01-the-essence-of-rag.md)
- [Structural Decomposition of Agents](en/chapters/05-architecture-and-orchestration/02-structural-decomposition-of-agents.md)
- [Glue Layers and Core Engines](en/chapters/05-architecture-and-orchestration/03-glue-layers-and-core-engines.md)
- [Implicit vs Explicit Orchestration](en/chapters/05-architecture-and-orchestration/04-implicit-vs-explicit-orchestration.md)
- [Error Propagation and Compensation](en/chapters/05-architecture-and-orchestration/05-error-propagation-and-compensation.md)
- [Over-Engineering Orchestration Frameworks](en/chapters/05-architecture-and-orchestration/06-over-engineering-orchestration-frameworks.md)

### Chapter 6 Testing, Evaluation, and Observability

Quality assurance for uncertain systems. Testing philosophy (structural validation is a solved problem; semantic validation and property testing are the real battleground), experiment management and statistical metrics, from evaluation to observability, graceful degradation and data flywheels.

- [Overview](en/chapters/06-testing-evaluation-and-observability/00-overview.md)
- [Testing Philosophy for Uncertain Systems](en/chapters/06-testing-evaluation-and-observability/01-testing-philosophy-for-uncertain-systems.md)
- [Experiment Management and Statistical Metrics](en/chapters/06-testing-evaluation-and-observability/02-experiment-management-and-statistical-metrics.md)
- [From Evaluation to Observability](en/chapters/06-testing-evaluation-and-observability/03-from-evaluation-to-observability.md)
- [Graceful Degradation and Data Flywheels](en/chapters/06-testing-evaluation-and-observability/04-graceful-degradation-and-data-flywheels.md)

### Chapter 7 Anti-Patterns and Pitfalls

Practices to watch out for. The fragility of prompt concatenation, multidimensional constraints of model selection, misjudging capability boundaries, and the most insidious anti-pattern — treating uncertainty as a defect.

- [Overview](en/chapters/07-anti-patterns-and-pitfalls/00-overview.md)
- [The Fragility of Prompt Concatenation](en/chapters/07-anti-patterns-and-pitfalls/01-the-fragility-of-prompt-concatenation.md)
- [Engineering Constraints of Model Selection](en/chapters/07-anti-patterns-and-pitfalls/02-engineering-constraints-of-model-selection.md)
- [Misjudging Capability Boundaries](en/chapters/07-anti-patterns-and-pitfalls/03-misjudging-capability-boundaries.md)
- [Treating Uncertainty as a Defect](en/chapters/07-anti-patterns-and-pitfalls/04-treating-uncertainty-as-a-defect.md)
- [When to Move from Prompting to Fine-Tuning](en/chapters/07-anti-patterns-and-pitfalls/05-when-to-move-from-prompting-to-fine-tuning.md)

### Chapter 8 Epilogue: The Next Form of Software Engineering

Historical rhythms of paradigm shifts, the return of specifications, the software engineer's next identity.

- [Overview](en/chapters/08-epilogue/00-overview.md)
- [Historical Rhythms of Paradigm Shifts](en/chapters/08-epilogue/01-historical-rhythms-of-paradigm-shifts.md)
- [The Return of Specifications](en/chapters/08-epilogue/02-the-return-of-specifications.md)
- [The Software Engineer's Next Identity](en/chapters/08-epilogue/03-the-software-engineers-next-identity.md)
- [Time Machine Verification](en/chapters/08-epilogue/04-time-machine-verification.md)

---

## About

Writing stance: Expressing personal views and philosophy. Not chasing consensus, not relying on authority.

Language: Originally written in Chinese. This English translation is provided for accessibility.

Read online: [GitHub Pages](https://onenightcarnival.github.io/llm-engineering-philosophy/en/)

License: [CC BY-NC-SA 4.0](LICENSE).
