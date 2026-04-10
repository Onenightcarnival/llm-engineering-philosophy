---
layout: home
hero:
  name: Engineering Philosophy of LLM Applications
  text: ""
  tagline: When the core component of a software system shifts from deterministic functions to probabilistic language models, what changes in software engineering principles — and what stays the same.
  actions:
    - theme: brand
      text: Start Reading
      link: /en/chapters/00-preface/00-overview
    - theme: alt
      text: GitHub
      link: https://github.com/Onenightcarnival/llm-engineering-philosophy
features:
  - title: Focus on "How to Think" Not "How to Do"
    details: Not a prompt cookbook, not a framework guide. A systematic answer to "what should software engineering look like in the age of LLMs."
  - title: Opinionated Personal Judgments
    details: Declarative over imperative, type systems over runtime checks, simple solutions over "impressive-looking" ones. Sharp opinions, not watertight correctness.
---

::: tip About This Translation
This is a translation of the original Chinese work. The translation may contain inaccuracies.
For the most accurate reading experience, please refer to the [original Chinese version](/).
:::

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

## Articles Worth Reading First

[Treating Uncertainty as a Defect](/en/chapters/07-anti-patterns-and-pitfalls/04-treating-uncertainty-as-a-defect) -- Prompts getting longer, constraints piling up, temperature set to 0, retry logic growing ever more complex — if you're doing these things, you may be fighting against the fundamental nature of LLMs.

[Over-Engineering Orchestration Frameworks](/en/chapters/05-architecture-and-orchestration/06-over-engineering-orchestration-frameworks) -- What 15 lines of code could accomplish, a framework does with seven layers of abstraction. That's not engineering — it's ceremony.

[AI-Assisted Programming Done Right](/en/chapters/03-human-ai-collaboration/01-ai-assisted-programming-done-right) -- "AI writes code, humans review" — this model is fundamentally wrong. Effective human-AI collaboration is layered control, not assembly-line quality inspection.

[Schema as Workflow](/en/chapters/04-declarative-prompts-and-type-contracts/03-schema-as-workflow) -- The field ordering in a schema defines the LLM's reasoning path. Each field carries one reasoning step; field-level single responsibility is the prerequisite for declarative chain-of-thought.
