---
originalLink: /chapters/05-架构与编排/04-隐式编排与显式编排
---

# Implicit vs Explicit Orchestration

## Two Paradigms of Orchestration

When a task requires multiple steps, the execution order, dependency relationships, and data passing among those steps constitute the orchestration problem. In LLM applications, orchestration takes two paradigms.

**Explicit orchestration** defines execution flow through external control structures. DAGs (directed acyclic graphs), state machines, workflow engines -- the developer explicitly declares in code "do A first, then B, if B fails do C." The execution flow is fully transparent to the developer: it can be visualized, tested, and version-controlled.

**Implicit orchestration** drives execution flow through data structures themselves. The Pydantic models discussed in Chapter 4 are one example: the order of fields defines the order of reasoning; nested structures define the hierarchy of reasoning. The developer does not declare "first analyze the topic, then extract the arguments" -- the structure definition inherently carries that order.

The core difference between the two paradigms is **who holds the control.** Explicit orchestration gives control to orchestration code written by the developer; implicit orchestration gives control to the data structure definitions and the LLM's generation process.

## Implicit Orchestration Is Underestimated

Discussion of orchestration in the LLM application space is almost monopolized by explicit orchestration -- LangChain's Chains, LlamaIndex's Pipelines, various DAG execution frameworks. But in a significant number of scenarios, implicit orchestration is the simpler and more reliable choice.

Consider a document analysis task: extract a summary, identify keywords, assess quality, provide recommendations.

The explicit orchestration approach:

```python
# Four independent LLM calls, explicitly chained
summary = call_llm("Extract summary", document)
keywords = call_llm("Identify keywords", document)
quality = call_llm("Assess quality", document, summary, keywords)
suggestion = call_llm("Provide recommendations", quality, summary)
```

The implicit orchestration approach:

```python
class DocumentAnalysis(BaseModel):
    summary: str = Field(description="Three-sentence summary of the document's core content")
    keywords: list[str] = Field(description="5 most important keywords")
    quality_score: float = Field(description="Content quality score, 0-1", ge=0, le=1)
    suggestion: str = Field(description="Improvement recommendations based on the above analysis")

result = call_llm_structured(document, DocumentAnalysis)
```

Implicit orchestration replaces four LLM calls with one; field order implicitly defines the chain of reasoning. This not only reduces API call count and latency, but also avoids a subtle problem in explicit orchestration: information loss in intermediate results. When the summary is serialized into a string and passed to the next call, the LLM's "understanding" of the original document is compressed. In a single structured output, the LLM can see the original document and all previously generated fields simultaneously when generating the suggestion.

## When Explicit Orchestration Becomes Necessary

The premise of implicit orchestration is: all steps can be completed within a single LLM call. Explicit orchestration becomes necessary when the following conditions arise:

**Steps involve external system calls.** If intermediate steps in the reasoning chain need to query a database, call an API, or execute code, these operations cannot happen within the LLM's single generation -- you must explicitly insert external calls between steps.

**Step inputs depend on runtime results.** If the prompt for step B needs to be dynamically constructed based on step A's output (not just data filling, but logical branching), implicit orchestration cannot handle this kind of dynamic branching.

**A single call's context cannot carry all the information.** When a task involves large volumes of documents, multi-round tool call results, or complex intermediate state, a single call's context window may not suffice. Explicit orchestration allows managing and compressing context between steps.

**Intermediate results require human review.** Some steps' outputs need human confirmation before proceeding. This human-in-the-loop requirement can only be implemented through explicit orchestration.

## Simple Explicit Orchestration

When explicit orchestration is needed, the simplest implementation is usually the best.

```python
async def analyze_and_act(user_request: str) -> str:
    # Step 1: Understand intent
    intent = await classify_intent(user_request)

    # Step 2: Execute different processing paths based on intent
    if intent.action == "search":
        results = await search_database(intent.query)
        return await summarize_results(results, user_request)
    elif intent.action == "calculate":
        data = await fetch_data(intent.parameters)
        computed = perform_calculation(data)  # Deterministic computation
        return await format_response(computed, user_request)
    else:
        return await direct_response(user_request)
```

This is plain Python control flow -- if/else, function calls, await. No DAG framework, no workflow engine, no special orchestration DSL. Python itself is the orchestration language.

The advantages of this "frameworkless orchestration":

- **Fully transparent**: the execution path is the code path; the IDE can jump to definitions, the debugger can set breakpoints.
- **Fully flexible**: any logic Python can express can be used for orchestration -- conditional branches, loops, exception handling, concurrency.
- **No extra dependencies**: not introducing a framework means not introducing the framework's abstraction leaks, version compatibility issues, or learning costs.

## When You Actually Need an Orchestration Framework

Orchestration frameworks (such as Prefect, Temporal, Airflow) provide value only when the following conditions are **all** met:

1. The workflow has many steps (> 10), and manually managing dependencies is error-prone.
2. Workflow state needs to be persisted, with support for resuming after interruption.
3. Distributed execution is required, with steps running on different machines.
4. A visual workflow monitoring and management interface is needed.

Note the intersection of these four conditions -- most LLM applications do not meet most of them. A 5-step RAG pipeline, a 3-round Agent loop, a linear document processing flow -- these can be orchestrated cleanly with ordinary Python functions and async/await.

The decision to introduce an orchestration framework should follow the principle from [Chapter 2](../02-uncertainty-and-decisions/00-overview.md): strategic decisions before tactical ones. First confirm whether the workflow is truly complex enough to need a framework, then choose which one. In most cases, the answer is that you do not need one.
