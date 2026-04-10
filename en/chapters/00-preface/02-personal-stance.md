---
originalLink: /chapters/00-序章/02-个人立场
---

# Personal Stance

## Why This Declaration Is Needed

Every technical book carries the author's biases. The difference is: some books pretend otherwise, some spell them out.

Pretending is more dangerous -- readers unknowingly absorb a particular set of value assumptions, believing they're reading objective facts. Spelling out the biases at least gives readers a choice: after understanding the author's position, they can decide for themselves which judgments to trust and which to discount.

This declaration provides calibration data. If you know how many degrees the telescope's optical axis is off, the observations are still useful.

## Three Core Beliefs

All arguments in this book rest on three beliefs. These beliefs preceded the writing and have been repeatedly tested in practice.

**Strategic judgment outweighs tactical execution by a wide margin.**

Architectural decisions matter far more than implementation details. The choice to position the LLM as the core engine versus a glue layer -- that single judgment has more impact than how you write your prompts, which framework you pick, or what parameters you tune. Spending serious time getting the strategic layer right is worth more than polishing the tactical layer. Get the strategy right, and rough tactics can be fixed; get the strategy wrong, and flawless tactics won't save you.

**Between knowing and doing lies the weakness of human nature.**

"Use the simple solution" is near-universal consensus, yet in practice, the complex solution gives people a sense of "having thought of everything." Introducing a framework feels more "professional" than writing 50 lines of code yourself. A microservices architecture feels more "advanced" than a monolith. These psychological tendencies -- the craving for certainty, the fascination with complexity, herd behavior -- are the most insidious traps in engineering decisions.

**Uncertainty is a constraint, not an enemy.**

The probabilistic output of an LLM is an essential property. Forcing an LLM into deterministic-function behavior -- say, with extremely low temperature plus extremely strict constraints -- often destroys the LLM's most valuable capabilities. The right approach: acknowledge that uncertainty exists, use type systems and testing frameworks to bound it within an acceptable range, and treat the level of uncertainty as a known condition in your system design.

These three principles are argued in detail in Chapter 2.

## Technical Preferences

The following preferences run throughout this book, listed here for reader calibration:

**Declarative over imperative.** Describing "what you want" is less error-prone, easier to verify, and easier to compose than describing "how to do it." SQL over hand-written loops to traverse a table, type definitions over runtime checks, Pydantic models over manual JSON parsing. Chapter 3 (Code as Prompt) and Chapter 4 (type systems and contracts) are where this preference shows most clearly.

**Simple solutions over "impressive-looking" ones.** If 50 lines of code can solve the problem, don't use a framework. If a single API call can do the job, don't orchestrate an Agent. Complexity has a cost -- every added layer of abstraction increases the burden of understanding and maintenance. The only defensible reason to choose complexity: the simple solution genuinely cannot meet the requirements, and you've verified this, not just guessed.

**Structure-driven over process-driven.** Good structure naturally guides the right process; the reverse doesn't hold. Define data structures and interface contracts first, and the process emerges on its own.

**Type systems over runtime checks.** Errors that can be caught at compile time (or definition time) shouldn't be left to runtime. Type annotations are executable specifications. In LLM applications, the Pydantic model definition itself is the best prompt -- this argument is made in detail in Chapter 4.

**Explicit dependencies over implicit conventions.** Every dependency in the system should be visible in the code. For LLM applications, this means what a prompt is composed of, what parameters the model uses, where the context comes from -- all should be traceable.

**Composition over inheritance.** Build complex systems by composing small, focused components, not by extending functionality through inheritance hierarchies. LLM calls are naturally self-contained units that lend themselves to composition.

These preferences all have boundaries and counterexamples. Declaring them is so readers know: when this book chooses between two equally reasonable options, what drives the choice.

## Blind Spots

The author's background: a double degree in mathematics and computer science at the undergraduate level, a master's in computer science (data science track). During four years at a major tech company, led the design of a Spring-like framework for Python.

The mathematical training produced a preference for forward derivation from foundational assumptions, but not every problem is suited to that treatment. Some engineering problems are best solved by "good enough" -- this book may push too hard in certain places.

During the years at a large company, the author worked within a team but gravitated toward solo design: think it through, then drive implementation. This means the book underserves topics like communication overhead, consensus-building, and the art of compromise.

The preference for "think first, then build" may undervalue rapid prototyping and iterative trial-and-error.
