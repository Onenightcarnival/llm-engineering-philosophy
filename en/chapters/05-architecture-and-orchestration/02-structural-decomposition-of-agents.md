---
originalLink: /chapters/05-架构与编排/02-Agent的结构分解
---

# Structural Decomposition of Agents

## Agent Is Not a Mysterious Concept

The term "AI Agent" carries far too much imagination. Autonomous decision-making, goal-driven behavior, environment perception, continuous learning -- these descriptions make Agents sound one step away from artificial general intelligence. But in current engineering practice, the structure of an LLM Agent can be precisely decomposed into a combination of three components:

**LLM + tool calling + loop control.**

The LLM understands the task and decides the next action. Tool calling translates the LLM's decisions into operations on external systems. Loop control determines when to continue and when to stop. Remove any one component and it is no longer an Agent in the usual sense: an LLM without tool calling is just a chatbot; an LLM with tools but no loop is a one-shot function call; tools with a loop but no LLM is traditional script automation.

```python
def minimal_agent(task: str, tools: dict, max_steps: int = 10) -> str:
    messages = [{"role": "user", "content": task}]

    for step in range(max_steps):
        # LLM decision: what to do next
        response = call_llm(messages, available_tools=tools)

        if response.is_final_answer:
            return response.content

        # Tool calling: execute the LLM's decision
        tool_result = tools[response.tool_name](**response.tool_args)

        # Loop control: feed the result back to the LLM, enter next iteration
        messages.append({"role": "assistant", "content": response.raw})
        messages.append({"role": "tool", "content": str(tool_result)})

    return "Maximum step limit reached"
```

This minimal Agent implementation is under 20 lines. The value of understanding this minimal structure is: when you need to build an Agent, start from this structure and add complexity incrementally, rather than starting from a heavyweight framework and trying to understand what it does.

## Design Principles for Tool Binding

Tools are the Agent's interface to the outside world. The quality of tool design directly determines the Agent's capability boundaries and reliability.

**Tools should be atomic.** One tool does one thing. "Search and summarize" is not a good tool -- split it into "search" and "summarize," and let the Agent decide whether and how to combine them. Atomic tools give the Agent greater compositional flexibility while making each tool's behavior more predictable.

**Tool inputs and outputs should have explicit type definitions.** Tool parameters should not be `**kwargs` or free-form strings. Pydantic models work equally well for defining tool parameters -- they provide the LLM with structured parameter descriptions while validating the LLM's generated parameter values at runtime.

```python
from pydantic import BaseModel, Field

class SearchParams(BaseModel):
    query: str = Field(description="Search keywords")
    max_results: int = Field(description="Maximum number of results to return", ge=1, le=20, default=5)
    date_range: str | None = Field(
        description="Date range filter, format: YYYY-MM-DD:YYYY-MM-DD",
        default=None
    )
```

**Tools should be idempotent, or at least safe.** Agents run in loops; the same tool may be called multiple times. If a tool has side effects (sending emails, creating orders, deleting data), repeated calls can cause problems. Idempotent design (repeated calls produce the same result) is preferred; if idempotency is impossible, at least implement deduplication or confirmation mechanisms at the tool level.

## Termination Conditions: The Most Overlooked Design Decision

When does the Agent's loop stop? This question seems simple but is actually the most error-prone part of Agent design.

**LLM self-determined termination.** The most common approach: the LLM judges that the task is complete and returns a final answer instead of a tool call. The problem is the LLM may terminate too early (giving an answer before the task is done) or never terminate (getting stuck in a tool-calling loop).

**Maximum step limit.** A hard cap to prevent infinite loops. But a fixed step limit is crude -- simple tasks may need only 2 steps, complex tasks may need 20. A limit set too low truncates complex tasks; too high wastes resources.

**Cost budget.** Forced termination when cumulative token consumption reaches a preset threshold. More precise than step limits, because token consumption varies greatly across steps.

**Timeout.** Termination when wall-clock time exceeds a threshold. Particularly important for user-facing applications -- users will not wait for an Agent to run for 5 minutes.

In practice, these termination conditions typically need to be combined. A robust Agent should have at least three layers of termination protection: the LLM's own judgment (normal path), step/cost limits (safety net), and timeout (last resort).

## The State Machine Perspective

Agent behavior can be formalized as a state machine. Each state represents a decision point; each transition represents a tool call or LLM reasoning step.

```
[Initialize] -> [LLM Reasoning] -> [Select Tool] -> [Execute Tool] -> [LLM Reasoning] -> ... -> [Output Result]
                    ^                                      |
                    └──────────────────────────────────────┘
```

Viewing Agents through the state machine lens has several benefits:

**Observability.** Every state transition is a recordable event. By logging the state sequence, you can trace the Agent's complete decision process -- which tools it called, in what order, and the input/output of each step.

**Testability.** You can write tests for specific state transitions: given a particular intermediate state, does the Agent choose a reasonable next step? This is more precise and more controllable than testing end-to-end behavior.

**Error recovery.** If a tool call fails, the state machine can roll back to the previous decision point and let the LLM choose an alternative. This is smarter than simple retry -- retry assumes the same operation will succeed; rollback allows the LLM to take a different path.

## When You Do Not Need an Agent

The loop control in Agents amplifies uncertainty -- every LLM decision is probabilistic, and the combination of multiple decisions makes system behavior harder to predict. The following scenarios can be handled with simpler architectures:

**Fixed task steps.** If the processing flow is predetermined (retrieve, then analyze, then summarize), you do not need an Agent -- a linear pipeline is more reliable, faster, and easier to debug. The value of an Agent is dynamic decision-making; fixed steps do not require dynamic decisions.

**No external tool interaction.** If the task involves only text processing (summarization, translation, classification), you do not need an Agent -- a single LLM call or a simple chain suffices.

**Extremely high reliability requirements.** Multi-step Agent decisions mean every step can fail, and errors accumulate. If the business demands 99.9% success rate, Agent architecture may not deliver -- a 99% success rate per step drops to 95% after 5 steps.

Choosing between an Agent architecture and a simple pipeline is a strategic architectural decision that should be settled before writing code.
