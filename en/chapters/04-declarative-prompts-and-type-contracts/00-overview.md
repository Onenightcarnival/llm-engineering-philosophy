---
originalLink: /chapters/04-声明式提示与类型契约/00-概述
---

# Chapter 4 Declarative Prompts and Type Contracts

Prompt engineering should be a branch of software engineering -- following the fundamental principles of software engineering while developing methods specific to the new paradigm.

This chapter covers two core concepts: **Code as Prompt** -- using Pydantic models to simultaneously serve as type definitions, semantic instructions, and output validators, where the code itself is the prompt; and **Schema as Workflow** -- where the arrangement of fields in a Schema defines the LLM's reasoning path, making structure the workflow.

## Articles

- [From Imperative to Declarative](01-from-imperative-to-declarative.md) -- From assembly to C, from jQuery to React, from natural language prompts to typed structural declarations -- every leap in abstraction level follows the same structural pattern. LLM prompt engineering is the latest instance of this pattern.
- [Code as Prompt](02-code-as-prompt.md) -- The three semantic layers of a Pydantic model (type annotations = constraint layer, Field description = semantic layer, Validator = invariant layer) make the code itself a prompt. Define once, enforce in three places. JSON Schema is the machine-readable projection of this model; its expressiveness has boundaries, and beyond those boundaries, runtime validation fills the gap.
- [Schema as Workflow](03-schema-as-workflow.md) -- The arrangement of fields in a Schema defines the LLM's reasoning path. Each field carries one reasoning step, and explicit dependency declarations between fields establish logical connections between reasoning steps. Field-level single responsibility is the precondition for declarative chain-of-thought.

## Reading Order

The first article establishes the historical context: the shift from imperative to declarative is a recurring pattern. The second and third articles are the core of this chapter: Code as Prompt and Schema as Workflow, which together form the complete picture of declarative chain-of-thought.
