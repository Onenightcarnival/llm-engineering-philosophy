---
originalLink: /chapters/02-不确定性与决策/01-战略大于分析
---

# Strategy Over Analysis

## The Analysis Trap

The most common failure mode in LLM application development happens at the decision level. The problem is spending limited time and attention on the wrong level.

A team spends three weeks benchmarking five LLMs on a particular benchmark, eventually picking the highest scorer. Then two weeks fine-tuning the prompt, pushing accuracy from 87% to 91%. Then a week integrating an orchestration framework. Six weeks later the system goes live, and the team discovers the real problem: this task should never have used an LLM in the first place -- a regex plus a rule engine would have solved it with 100% accuracy, two orders of magnitude less latency, and three orders of magnitude less cost.

This is a structural cognitive bias: when you have a hammer, everything looks like a nail. Every decision the team made on model selection, prompt tuning, and framework integration was reasonable at the tactical level. The mistake was strategic -- the task did not need an LLM. If someone had spent two hours in the first week making that judgment, the next five weeks of work could have been skipped entirely.

## The Precise Meaning of Strategy Over Analysis

Time, attention, and cost are finite. Strategic direction has far more impact on a system's success or failure than tactical refinement. Get the strategic direction right and the system can succeed even with rough tactics. Get it wrong and no amount of tactical excellence can rescue a plan that was doomed from the start.

In LLM engineering, strategic decisions include: Should this task use an LLM? What role does the LLM play in the system -- core engine or auxiliary component? Where is the tolerance boundary for uncertainty? Tactical decisions include: GPT-4o or Claude? What temperature? How to optimize the prompt? Which framework? Tactical decisions only matter when the strategic direction is correct.

## Strategic Decision Framework

To put strategic decisions into practice, you need to answer questions at three levels.

**Task fit.** The criterion is whether the LLM has a structural advantage over alternatives for this task. [Chapter 1](../01-epistemology/02-software-engineering-without-certainty.md) already drew the boundary: precise computation, state maintenance, and consistency guarantees are outside it; intent parsing, natural language generation, and pattern recognition are inside it. Fit exists on a spectrum -- from strong fit (the LLM has an irreplaceable advantage) to no fit (the task's core requirements exceed the capability boundary).

**Uncertainty tolerance.** How much uncertainty can the system absorb? An internal tool that occasionally makes mistakes is acceptable; a customer-facing contract generation system is not. Tolerance determines how thick the validation layer needs to be, the degree of redundancy, and how rigorous the human review process must be. In zero-tolerance scenarios, the LLM should not be the final decision-maker -- zero fault tolerance and probabilistic output are inherently contradictory.

**Architectural positioning.** What role does the LLM play in the system? In the core engine pattern, the system's reliability ceiling is the LLM's reliability. In the intelligent interface pattern, the LLM handles natural language input and output while core business logic runs on deterministic code -- most production systems should default to this pattern. In the auxiliary component pattern, the system's main flow does not depend on LLM output.

These three layers of assessment should be completed before writing the first line of code. The classification itself is coarse-grained, but it forces the team to think about the problem at the right level.

## Common Tactical Traps

**Benchmark worship.** Spending enormous time comparing models on standard benchmarks, when benchmarks measure general capability and your task is specific. Start by running any mainstream model on ten real data points to build a prototype; confirm the task is feasible before worrying about model selection.

**Prompt alchemy.** Endlessly tweaking prompt wording without convergence criteria -- not knowing when to stop. If a task requires an exquisitely crafted prompt just to barely work, that itself is a signal: maybe what you need is better architectural design. Define quality thresholds in advance; if you cannot meet them, escalate to the architectural level.

**Over-investing in framework selection.** Going back and forth between LangChain, LlamaIndex, and CrewAI for three weeks without writing any business code. Frameworks solve code organization problems; choosing a framework before the business logic is clear is like choosing a vehicle before you have a map. Implement the core logic as a prototype in plain Python first; consider a framework after the direction is confirmed.

## How to Put This into Practice

**Write a strategic assessment document.** Before any LLM project begins, write a one-page strategic assessment: Why use an LLM instead of alternatives? What role does the LLM play? Where is the uncertainty tolerance boundary?

**Set convergence criteria.** Before starting prompt optimization or model comparison, define in advance what results mean the direction is correct and what results mean a strategic adjustment is needed. Optimization without a known stopping condition is an infinite loop.

**Prototype validation before system building.** Use the minimum amount of code to validate core assumptions, then decide based on results whether to proceed, investigate further, or pivot. The value of prototype validation is obtaining strategically critical information at minimal cost.

**Write down implicit assumptions.** When the team is debating technology choices, have each person write down their probability estimates and value judgments for various outcomes. The real source of disagreement surfaces immediately -- it is usually about differing estimates of failure scenario probabilities or differing assessments of failure severity. Writing them down also exposes tail risks that are easy to overlook.

**Eliminate infeasible options first, then rank.** Turn constraints (cost ceiling, latency ceiling, reliability floor, development timeline, team tech stack) into a checklist; failing any one item means elimination. The remaining feasible options are usually few, and the decision becomes easy. A theoretically superior option that violates a hard constraint is not an option at all.

One addendum: the above analytical tools apply to high-impact, low-reversibility decisions. If the consequences are small and the decision is easily reversible (say, a wording tweak in a prompt), running an experiment is more efficient than analysis. Knowing when to analyze, and how deeply, is itself a strategic judgment.

The higher the decision level, the longer the feedback cycle. People tend to optimize repeatedly at low levels where feedback is fast -- each adjustment produces immediate results. Strategic decisions at the high level have slow feedback, and mistakes often take weeks to surface. By the time the wrong direction is discovered, substantial irrecoverable resources have already been sunk into it.
