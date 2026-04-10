---
originalLink: /chapters/04-声明式提示与类型契约/01-从命令式到声明式
---

# From Imperative to Declarative

## A Recurring Transformation

From assembly to C, from C to SQL, from jQuery to React, from Makefile to Terraform -- the history of software engineering is marked by the same transformation happening over and over: from imperative to declarative. Each time, it does the same thing -- offloads the burden of "how to do it" to the system, so developers only need to declare "what they want."

LLM application development is undergoing the same transformation. From hand-crafting natural language prompts (imperative) to declaring expected outputs through type systems and code structures (declarative) -- this is the latest instance of the same pattern in software engineering history.

## Examples You Have Already Seen

C lets you write `a = b + c` instead of four assembly instructions. Register allocation, instruction scheduling, memory layout -- those decisions got handed to the compiler. Seems trivial, but that was a transformation: programmers went from "how to add" to "what result I want."

SQL went further. `SELECT name FROM companies WHERE revenue > 1000000` says nothing about which index to use, what order to scan in, or whether to sort in memory or on disk. In the navigational database era, all of that was the programmer's job. After SQL, the query optimizer took over those decisions -- and did it better than the vast majority of programmers.

React did the same thing in the UI domain. In the jQuery era you manipulated the DOM: find elements, change attributes, add classes. After React, you just describe "given this state, what should the UI look like," and the reconciliation algorithm decides how to actually update the DOM.

Looking back over these four decades, every transformation did the same thing -- moved the "how to do it" decisions from humans to systems, while introducing some constraint language to express "what is wanted." And every transformation shared three characteristics:

- The cost of abstraction was manageable. C was a few percentage points slower than hand-written assembly, not several times slower.
- The newly introduced constraints actually increased reliability. Type systems look like restrictions but are in fact protections.
- The old paradigm did not disappear; it just retreated to places that genuinely require fine-grained control. You can still write inline assembly on performance-critical paths.

## Placing LLMs in This Pattern

Place LLM prompt engineering in the same table, and its position becomes obvious:

| Domain | Imperative Form | Declarative Form | Delegated Decisions | Constraint Language |
|--------|----------------|-----------------|---------------------|-------------------|
| Systems programming | Assembly language | C language | Register allocation, instruction scheduling | Type system and function signatures |
| Data querying | Navigational databases | SQL | Index selection, scan strategy | Relational algebra syntax |
| UI development | jQuery DOM manipulation | React components | DOM diff and incremental updates | Props and state type definitions |
| Infrastructure | Manual server configuration | Terraform / K8s | Resource creation order, state convergence | HCL / YAML resource declarations |
| LLM prompt engineering | Natural language prompts | Typed structural declarations | Reasoning paths and output formats | Pydantic / JSON Schema |

The more precise the constraint language, the more predictable the system behavior.

## Imperative Residue in LLM Prompt Engineering

The mainstream prompt engineering practice today is still imperative. A typical imperative prompt:

```
You are a professional document analyst. Please analyze the given document
following these steps:

Step 1: Read the entire document and identify the topic and document type.
Step 2: Extract all key entities (names, organizations, dates, amounts).
Step 3: Analyze the relationships between entities.
Step 4: Based on the above analysis, generate a structured summary.

The summary should include the following sections:
- Document overview (no more than 3 sentences)
- Key entity list
- Relationship graph description
- Conclusions and recommendations

Please ensure the output is in JSON format.
```

The problems with this prompt are structurally the same class of problems faced in the assembly era and the jQuery era: control flow depends on natural language understanding rather than hard constraints, the output contract is a wish rather than a constraint, the entire prompt is neither composable nor independently testable. The developer is operating at the wrong level of abstraction -- details that should be handled by the system are being managed manually.

## The Direction of Declarative Prompt Engineering

The core shift in declarative prompt engineering is: replace procedural descriptions with type definitions, replace natural language instructions with structural constraints. This shift corresponds to two core concepts that form the main thread of the rest of this chapter:

**Code as Prompt.** Pydantic models simultaneously serve as type definitions, semantic instructions, and output validators. Define once, enforce in three places. The code itself is the prompt -- no separate natural language text is needed to describe "please output in this format." The [next article](02-code-as-prompt.md) develops this concept.

**Schema as Workflow.** The arrangement of fields in a model defines the LLM's reasoning path. Field order is the chain-of-thought steps; dependency declarations between fields are the logical connections between reasoning steps. A Schema does not merely describe the structure of the output -- it simultaneously orchestrates the reasoning process that produces that output. The [third article](03-schema-as-workflow.md) develops this concept.

## Reserved Territory for the Imperative

The declarative paradigm is not about eliminating the imperative. Which paradigm to choose can be determined by looking at the structural characteristics of the output space:

| Task Type | Output Space | Structural Stability | Recommended Paradigm | Rationale |
|-----------|-------------|---------------------|---------------------|-----------|
| Structured data extraction | Bounded | Stable | Declarative | Output structure is well-defined, fields and types are known; declarative constraints maximize reliability |
| Creative writing | Open | Unknown | Imperative | The output space is inherently open-ended; type constraints would stifle creativity |
| Customer service intent classification | Bounded | Stable | Declarative | Output is a finite enumerated set; Literal types are a natural fit |
| Code review | Bounded | Evolving | Hybrid | The structure of the issue list is fixed (declarative), but the description of each issue requires free expression (imperative) |

The key judgment comes down to two points: can the outputs be exhaustively enumerated, and is the structure stable? When the output is bounded and structurally stable, the declarative paradigm has the greatest advantage. When the output is open-ended and the structure is unknown, the flexibility of the imperative paradigm is irreplaceable.
