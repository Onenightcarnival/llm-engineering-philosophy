---
originalLink: /chapters/03-人机协作的软件过程/02-代码审查中的人机分工
---

# Human-AI Division of Labor in Code Review

## Two Layers of Review

Code review has never been a single activity. It comprises at least two fundamentally different types of tasks: pattern matching and judgment.

Pattern matching is deterministic: this variable name violates naming conventions, this code has an unhandled exception, this SQL query is vulnerable to injection. These issues have clear rules to adjudicate -- given the rule and the code, the conclusion is unambiguous.

Judgment is probabilistic: is this level of abstraction appropriate, is this design decision correct for the current business stage, will this code's maintainability become a problem six months from now. These questions have no single right answer -- they require the reviewer to weigh business context, team capability, and system evolution trajectory.

Mixing these two types of tasks together, performed by the same person in the same review pass, is the most wasteful practice in code review today. The reviewer's attention gets scattered by formatting issues and naming inconsistencies, leaving no mental energy for the design questions that actually matter.

## AI's Reliable Territory

AI's review capability at the pattern-matching layer already surpasses most human reviewers. Pattern-matching tasks have two characteristics that make them inherently suitable for AI: rules are highly formalizable, and only local context is needed.

**Format and style consistency.** Indentation, blank lines, import ordering, brace style -- these rules can be fully formalized, and AI's checking results are as deterministic as a linter's. AI's incremental value over traditional linters is its ability to understand semantic-level style consistency: in the same codebase, some modules create objects via factory patterns while others call constructors directly -- a linter cannot catch this inconsistency, but AI can identify it from context.

**Common bug patterns.** Resource leaks (files opened but never closed), null dereferences, out-of-bounds access, type mismatches -- these bug patterns have been thoroughly cataloged across decades of software engineering history. AI can check for all known patterns in a single review pass, while a human reviewer's attention is serial and limited.

**Security anti-patterns.** SQL injection, XSS, hardcoded credentials, insecure deserialization -- the core of security review is pattern recognition, and AI has two structural advantages here: it does not miss things (no attention fatigue), and its pattern library can be continuously updated (new CVEs translate into new check rules).

**Documentation-code consistency.** A function signature changed but the docs were not updated, a parameter was renamed but the comment still uses the old name, the declared return type does not match the actual return -- AI can automatically detect drift between code and documentation, which is the issue human reviewers are most likely to overlook under time pressure.

The fundamental reason to hand these tasks to AI is that the marginal cost of AI doing them approaches zero. Every minute a human reviewer spends on format checking is a minute stolen from design review.

## The Irreplaceable Human Territory

Judgment-layer review is beyond AI's current capability -- these judgments require context that a context window simply cannot contain.

**Architectural fitness.** A piece of code may look flawless in isolation but be a wrong decision in the context of the system as a whole. Should this module be a standalone service or a library? Will this dependency direction create cycles in the future? These questions require judgment about the system's evolution trajectory, far beyond code-level pattern matching. AI lacks this system-level perspective -- it can see the code submitted, but not the technical intent behind it.

**Business logic correctness.** The code correctly implements the requirements spec, but is the spec itself sound? A discount calculation has no mathematical bugs, but does the discount rule match the business intent? This kind of judgment requires domain knowledge -- the tacit kind that never gets written down: team consensus, the backstory of historical decisions, product direction trade-offs.

**Trade-off evaluation.** A huge number of decisions in software engineering are trade-offs, not right-vs-wrong: performance vs. readability, flexibility vs. simplicity, short-term delivery pressure vs. long-term maintainability. The "Strategy over Analysis" point discussed in [Chapter 2](../02-uncertainty-and-decisions/01-strategy-over-analysis.md) applies directly here -- trade-off evaluation is a strategic judgment. AI can list the pros and cons of each option (analysis), but it cannot make the actual trade-off call (decision) on the human's behalf.

**Team and organizational context.** Is the author of this code a new hire or a senior engineer? Is the review goal mentorship or gatekeeping? Is the team currently racing toward a deadline or paying down tech debt? These factors profoundly shape the review strategy and the tone of feedback, yet they exist entirely outside the code.

## Workflow Design: A Serial Pipeline

The correct topology for human-AI collaborative review is serial: AI reviews first, filtering out pattern-level issues, then humans focus on design-level issues on that clean foundation.

Why serial over parallel: in a parallel model, humans are still distracted by pattern-level issues -- even if AI has already flagged them, reviewers will still notice them while reading the code. The critical operation in a serial model is this: after AI review passes, format and style issues are auto-fixed, so the code humans see is already a clean version that has passed pattern-level checks.

The division across the two layers can be made explicit in a classification table:

| Layer | Owner | Review Categories | Characteristics |
|-------|-------|-------------------|-----------------|
| Pattern layer | AI | Format consistency, naming conventions, unused imports, resource leaks, null safety, SQL injection risk, hardcoded credentials, documentation-code drift | Rules are formalizable, verdicts are unambiguous, auto-fixable |
| Judgment layer | Human | Architectural fitness, business logic correctness, design trade-offs, abstraction level appropriateness, performance strategy choices | Context-dependent, no single right answer, requires domain knowledge |

## Confidence and Escalation Mechanisms

The AI review layer should not just output "issue found" or "no issue" -- it should also output its confidence level. Low-confidence pattern-level findings should automatically escalate to the human review layer, rather than being auto-fixed or auto-dismissed.

The principle is the same as test layering: structural checks can be automated and fully trusted; semantic checks require human involvement. The review process should concentrate human attention where judgment is most needed.

## Simplifications of the Model

This layered model assumes that pattern-level issues and judgment-level issues can be cleanly separated. In reality, the two are often entangled. A naming issue might reflect a conceptual misunderstanding (judgment-level); an architectural decision might manifest as a well-known anti-pattern (pattern-level). When boundaries are blurry, the layered model requires human arbitration, which means the process design must preserve an escalation path rather than pretending the boundary is clean.

Another practical limitation is tool maturity. As of now, AI tools that can reliably perform pattern-level review still require substantial configuration and tuning, and their false positive rates on certain codebases can be high enough to erode team trust in review results. The reliability of the tools themselves requires ongoing investment to maintain -- an operational cost that is frequently underestimated.
