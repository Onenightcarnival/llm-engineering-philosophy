---
originalLink: /chapters/05-架构与编排/06-编排框架的过度设计
---

# Over-Engineering Orchestration Frameworks

## An Opinion Piece

This is an opinion piece, not a technical analysis. It expresses a considered engineering judgment.

That judgment is: the most popular orchestration frameworks in the LLM application space solve problems that developers do not actually need solved, while introducing complexity that developers are forced to deal with.

## Abstraction Level Bloat

The core problem with orchestration frameworks, represented by LangChain, is abstraction level bloat. A simple LLM call gets wrapped in layer after layer of abstraction: Prompt Template, Chain, Agent, Executor, Memory, Callback, OutputParser.

Each layer of abstraction has a design rationale, but stacking abstractions produces a combinatorial explosion. When you need to debug a Chain that is not behaving as expected, you need to understand: how the Prompt Template renders, how the Chain passes variables, how Memory injects history, how the OutputParser parses results, how Callbacks affect execution flow. Any layer could be the source of the problem.

Compare the frameworkless implementation:

```python
# No framework: ~15 lines of code for the same functionality
messages = [{"role": "system", "content": system_prompt}]
messages.extend(history[-10:])  # Last 10 rounds of history
messages.append({"role": "user", "content": user_input})

response = client.chat.completions.create(
    model="gpt-4",
    messages=messages,
    response_format={"type": "json_object"}
)

result = json.loads(response.choices[0].message.content)
```

This code has no abstractions. What it does, in what order, and the input/output of every step -- all visible. When behavior deviates from expectations, the debugging target is obvious. When behavior needs to change, the modification point is direct.

## Concept Overload

Orchestration frameworks introduce a large number of domain-specific concepts. Chain, Agent, Tool, Memory, VectorStore, Retriever, Loader, Splitter, Embedding, Callback, OutputParser -- each concept has its own interface, configuration, and behavior.

Not all of these concepts are necessary. Many are simply re-branded standard programming operations:

- **Chain** is function composition.
- **Memory** is variable storage.
- **Callback** is an event hook.
- **Loader** is file I/O.
- **Splitter** is string splitting.

Renaming these operations with framework-specific terminology creates the false impression that "LLM programming requires special tools." In reality, Python's functions, lists, dictionaries, and standard library already provide these capabilities. The framework just wraps a unified interface around what already exists.

A unified interface has value -- when you need to quickly swap between different implementations (different vector databases, different embedding models). But weigh the cost: the time spent learning framework concepts, the difficulty of debugging framework behavior, and the maintenance burden as the framework evolves across versions.

## Unnecessary Indirection

One of the framework's core selling points is "composability" -- assembling small components into complex workflows. But in practice, LLM application workflows are typically simple linear chains or shallow conditional branches. They do not need DAG-level composition capabilities.

When the workflow is "retrieve, then generate," one function calling another suffices. When the workflow is "route to different handlers based on intent," an if-else suffices. Introducing Chain abstractions and LCEL (LangChain Expression Language) syntax for these simple flows is asking for trouble.

Scenarios that genuinely need complex orchestration -- distributed execution, persistent state machines, visual workflows -- should use general-purpose tools designed for those scenarios (Temporal, Prefect, Airflow). General-purpose orchestration tools have been battle-tested in far more production environments, have more active communities, and more stable APIs.

## Legitimate Use Cases for Frameworks

The above critique does not mean frameworks are worthless. Frameworks have legitimate use cases in the following scenarios:

**Rapid prototyping.** During the exploration phase, frameworks provide scaffolding for quick experimentation. Spinning up a RAG prototype with LangChain in half an hour is faster than writing from scratch. The key: after the prototype is validated, the production implementation should reconsider whether to keep the framework.

**Standardized integration.** When a team needs to reuse the same component configurations (embedding models, vector databases, document loaders) across multiple projects, the framework's unified interface reduces duplicate code.

**Onboarding newcomers.** For developers unfamiliar with LLM application development, the framework's entry barrier is lower than figuring things out from scratch.

## The Alternative

If not frameworks, then what?

**Use LLM API clients directly.** OpenAI's Python SDK, Anthropic's SDK -- these official clients provide clean interfaces without unnecessary abstractions.

**Pydantic + standard library.** The Pydantic models discussed in Chapter 4 provide structured output definition and validation. Python's asyncio provides concurrency. The json module provides serialization. The combination of these tools covers the orchestration needs of the vast majority of LLM applications.

**Import only the components you need.** If you only need vector retrieval, import a vector database client. If you only need text splitting, write a 50-line splitting function.

Among all workable approaches, the simplest one is the best. This is a basic principle of software engineering, and LLM applications are no exception.
