---
originalLink: /chapters/07-反模式与陷阱/03-能力边界的误判
---

# Misjudging Capability Boundaries

## Two Symmetrical Mistakes

There are two symmetrical capability misjudgments in LLM application development: overestimating the LLM's own capability boundaries, and overestimating the abstraction power of LLM frameworks. The former places the model where it does not belong (factual queries); the latter places the framework where it does not belong (as a carrier for business logic). The essence is the same -- misunderstanding what a tool can do means the system will break wherever it is asked to operate beyond the tool's actual capabilities.

## Overestimating the Model: Using an LLM as a Database

An LLM appears to "know everything." Ask it for the parameter list of some API, and it can answer; ask it for the date of a historical event, and it gives you one. This appearance creates a seductive illusion: the LLM is a knowledge base with a natural language interface.

The root of the illusion: a database stores data, and queries return exact matches; an LLM stores a statistical compression of its training data, and "queries" return samples from a conditional probability distribution. These are fundamentally different things.

Statistical compression has three engineering consequences. The training data cutoff means the model's "knowledge" is frozen at a point in time, and it will not tell you what it does not know -- it delivers outdated information with the same confidence as current information. Frequency bias means the model "remembers" information that appeared frequently in its training data better, making it least reliable precisely in the long-tail scenarios where you most need accuracy. Hallucination is the most fundamental problem -- the model will not say "I don't know" but instead generates an output that "looks like a correct answer" statistically, with no distinguishable features from genuine information at the text level.

## The Correct Division of Responsibilities

The correct use of an LLM is to understand natural language intent and transform it into structured queries -- intent parsing is what it excels at.

```python
from pydantic import BaseModel, Field
from typing import Literal


class ProductQuery(BaseModel):
    """The LLM's output: structured query intent, not query results."""
    product_category: str
    attributes: list[str] = Field(
        description="Product attributes the user cares about, such as price, specs, inventory"
    )
    comparison: bool = Field(
        description="Whether the user is comparing products"
    )
    time_constraint: Literal["current", "historical"] = "current"


def handle_product_question(user_input: str):
    """Correct division of responsibilities: LLM parses intent, database provides facts."""

    # Step 1: LLM transforms natural language into structured query intent
    query = llm_parse(user_input, output_type=ProductQuery)

    # Step 2: Use the structured query against the actual data source
    results = product_database.query(
        category=query.product_category,
        attributes=query.attributes,
    )

    # Step 3 (optional): LLM organizes the structured results into a natural language response
    response = llm_generate(
        system="Answer the user's question based on the following product data. Only use the provided data; do not fabricate information.",
        context=results,
        user_query=user_input,
    )
    return response
```

The key to this pattern: the LLM does intent parsing in step one (what it is good at), factual information comes from the database (a deterministic, auditable system), and the LLM does natural language generation in step three (what it is good at), but the basis for generation is facts provided by the database.

## A Pragmatic Tiered Strategy

Completely prohibiting an LLM from answering any factual question is unrealistic in some scenarios. The pragmatic approach is to handle things by risk tier.

**High-risk facts: external verification is mandatory.** Factual information involving legal, medical, financial, or safety matters must come from authoritative data sources; the LLM is responsible only for intent parsing and result organization. This is a non-negotiable baseline. Specifically: the system architecture should include an explicit "fact gateway" -- any high-risk fact must pass through an external data source verification path before entering the final output. If the external data source is unavailable, the system should fall back to "unable to answer" rather than letting the LLM make something up.

**Medium-risk facts: annotate source and timeliness.** Product information, technical documentation, historical data -- use RAG to retrieve from trusted data sources, and annotate the information source and retrieval time in the output. Let users know what the information is based on. The key design point: make the timeliness of retrieved results visible to the user ("based on documentation from March 2024"); the system must not silently swallow this.

**Low-risk facts: allow direct answers, but include a disclaimer.** Common knowledge, non-critical background information -- these can rely on the model's "knowledge," but the system should clearly inform users that this information has not been verified in real time. This is a design posture of honesty: let users decide for themselves whether cross-verification is needed.

## Overestimating Frameworks: The Amplification Effect of Leaky Abstractions

The other side of capability misjudgment is overestimating the abstraction power of LLM orchestration frameworks. [Chapter 5](../05-architecture-and-orchestration/06-over-engineering-orchestration-frameworks.md) already discussed the framework problem from the angle of "over-engineering." Here we discuss a different but related dimension: even if you choose a framework that currently seems reasonable, over-relying on it will still create serious technical debt.

All abstractions leak -- Joel Spolsky pointed this out twenty years ago. But in the LLM domain, the consequences of leaky abstractions are more severe than in traditional software. LLM framework abstractions are built on top of a system that is itself non-deterministic. When the framework tells you to "use the `Agent` class to build an autonomous decision-making system," it hides enormous amounts of detail about prompt engineering, error handling, and cost control. When the system behaves unexpectedly, you need to understand both the framework's abstraction layer and the LLM's probabilistic behavior simultaneously -- the compounding of two layers of uncertainty makes debugging difficulty multiplicative, not additive.

Four signals of framework lock-in: your business logic cannot run without the framework; framework upgrades become a project risk; you are writing code to work around the framework's limitations; debugging requires understanding the framework's internals. If you hit two or more of these, the framework has already transformed from "a time-saving tool" into "a complexity-adding burden."

## Design Principles for Reducing Framework Lock-In

Using a framework is reasonable for rapid prototyping during the exploration phase, standardized requirements, and team capability constraints. But if you decide to use one, the following principles can reduce lock-in risk.

Confine framework usage to the infrastructure layer; do not let the framework's types and interfaces permeate your business logic. Business logic depends on interfaces you define; the framework is one implementation of those interfaces -- switching frameworks means replacing the implementation, not rewriting business logic. Periodically verify: without this framework, the core functionality can still be built. Do not hand over every feature to a framework just because you adopted one -- every additional feature point that depends on the framework increases switching cost by one increment.

Using an LLM as a database and framework lock-in are both, at their core, misjudgments of a tool's capability boundaries. The capability boundaries drawn in [Chapter 1](../01-epistemology/02-software-engineering-without-certainty.md) manifest most directly in real-world engineering: the correct approach is to let each tool do what it does best. In a field where a new paradigm appears every few months, understanding what each tool can and cannot do is a foundational skill.
