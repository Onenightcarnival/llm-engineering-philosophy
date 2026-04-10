---
originalLink: /chapters/04-声明式提示与类型契约/03-Schema-as-Workflow
---

# Schema as Workflow

## Field Order Is Reasoning Order

[Chapter 1](../01-epistemology/01-one-token-at-a-time.md) discussed the nature of autoregressive generation: LLMs generate tokens sequentially, with each token conditioned on all previously generated tokens. When an LLM fills a Pydantic model in structured output mode, it generates content in the order the fields are defined. Later fields can "see" the values of all preceding fields.

This means the arrangement of fields in a Schema is not just a way of organizing data structures -- it simultaneously defines the LLM's reasoning path.

```python
from pydantic import BaseModel, Field

class DocumentAnalysis(BaseModel):
    """Analyze the core arguments and argumentative structure of a document."""

    main_topic: str = Field(
        description="The core topic of the document, summarized in one sentence"
    )
    key_claims: list[str] = Field(
        description="Key claims made in the document, sorted by importance in descending order"
    )
    evidence_quality: str = Field(
        description="Based on the above key_claims, assess the quality of supporting evidence: strong, moderate, or weak"
    )
    conclusion: str = Field(
        description="Synthesizing main_topic, key_claims, and evidence_quality, "
                    "provide an overall assessment of this document"
    )
```

When the LLM processes this model: first it identifies the topic, then extracts claims, then evaluates evidence quality, and finally produces a conclusion. The generation of `conclusion` is built on the preceding three fields -- it can reference the already-generated topic judgment, list of claims, and evidence assessment.

The field arrangement implicitly defines the steps of a Chain-of-Thought -- this is Schema as Workflow. Traditional CoT guides reasoning through natural language instructions ("first think about... then analyze..."); declarative CoT guides reasoning through structural definitions. Traditional CoT relies on natural language guidance; declarative CoT relies on the hard constraints of the output format to determine reasoning order.

But structural constraints govern the **order and decomposition** of reasoning, not its **quality**. An LLM can perfectly well generate fields in order while phoning it in on any given field. Declarative CoT guarantees the execution order of "do A before B," but "how well A is done" still depends on the quality of Field descriptions and the model's own capabilities.

## One Task Per Field

Schema as Workflow has a precondition: each field carries one and only one reasoning step. If a field's description crams in multiple tasks, then field order defining the reasoning path breaks down -- a single step mixes multiple reasoning tasks, and the LLM has no structural guidance within that field.

```python
from pydantic import BaseModel, Field
from typing import Literal


# Bad example: one field carrying three tasks
class BadAnalysis(BaseModel):
    result: str = Field(
        description="Analyze the sentiment polarity of the text, extract product names "
                    "mentioned in it, and provide a priority judgment"
    )
```

This `result` field asks the LLM to do three things at once: sentiment analysis, entity extraction, and priority judgment. The three tasks have different failure modes and quality criteria, yet they are crammed into a single string field with no way to evaluate or optimize them independently. More importantly, there may be dependencies between the three tasks (priority judgment should be based on the sentiment analysis result), but this dependency cannot be structurally expressed within a single field.

```python
# Good example: one reasoning step per field
class GoodAnalysis(BaseModel):
    sentiment: Literal["positive", "negative", "neutral"] = Field(
        description="The sentiment polarity of the text"
    )
    products: list[str] = Field(
        description="Product names mentioned in the text"
    )
    priority: Literal["high", "medium", "low"] = Field(
        description="Processing priority determined based on the above sentiment"
    )
```

Three fields, three reasoning steps. Each field has its own type constraint (`Literal` enum, `list[str]`) and can be validated independently. The description of `priority` explicitly references `sentiment`, declaring the dependency between reasoning steps.

This is single responsibility at the field level. The consequences of violating it are the same as violating SRP in code.

## Explicit Dependency Declaration

Dependencies between fields need to be explicitly declared in descriptions. Although the LLM can "see" the values of preceding fields when generating subsequent ones, it will not necessarily use them proactively -- unless the description explicitly tells it to do so.

```python
from pydantic import BaseModel, Field
from typing import Optional


# Implicit dependency: LLM may generate recommendation independently, ignoring analysis
class ImplicitDependency(BaseModel):
    analysis: str = Field(description="Analyze the text content")
    recommendation: str = Field(description="Provide a recommendation")


# Explicit dependency: recommendation explicitly declares it is based on the analysis
class ExplicitDependency(BaseModel):
    analysis: str = Field(description="Analyze the text content")
    recommendation: str = Field(
        description="Based on the conclusions from the above analysis, provide specific improvement recommendations"
    )
```

In simple structures, the difference is not obvious. But with many fields, implicit dependencies lead to unpredictable behavior. In a model with 10 fields, if dependencies between fields are not explicitly declared in descriptions, how the LLM handles inter-field relationships becomes anyone's guess -- sometimes correct by coincidence, sometimes completely off-target.

The approach is straightforward: in the descriptions of subsequent fields, reference the names of preceding fields and state the relationship between them. "Based on the above X," "synthesizing X and Y," "building on X" -- these descriptions chain the reasoning steps together.

## Composition and Nesting

When a reasoning step itself requires structured sub-steps, express this through type nesting.

```python
from pydantic import BaseModel, Field
from typing import Literal


class SentimentAnalysis(BaseModel):
    """Sentiment analysis: an independent reasoning unit."""
    sentiment: Literal["positive", "negative", "neutral"]
    confidence: float = Field(ge=0.0, le=1.0)


class ProductExtraction(BaseModel):
    """Product extraction: an independent reasoning unit."""
    products: list[str] = Field(
        description="Product names mentioned in the text"
    )


class CustomerEmailAnalysis(BaseModel):
    """Complete workflow for customer email analysis."""
    sentiment: SentimentAnalysis = Field(
        description="Perform sentiment analysis on the email"
    )
    products: ProductExtraction = Field(
        description="Extract product information from the email"
    )
    priority: Literal["high", "medium", "low"] = Field(
        description="Determine processing priority based on the above sentiment result"
    )
    reply: str = Field(
        description="Synthesizing the analysis results of sentiment, products, and priority, "
                    "generate an appropriate customer reply"
    )
```

`SentimentAnalysis` and `ProductExtraction` are independent reasoning units, reusable in other tasks. `CustomerEmailAnalysis` nests them to compose a complete workflow, with the arrangement of top-level fields defining the step order.

Note that the description of the `reply` field references all three preceding fields -- this is the explicit declaration of dependencies. Composition establishes structured relationships through type nesting and field references, rather than concatenating four prompt fragments together.

This is modularity at the type level: high cohesion, low coupling, composed through type definitions. Each sub-model can be tested and evolved independently; the composed model defines the order in which they work together through field arrangement.

## Design Principles for Field Arrangement

Field arrangement is not arbitrary; it should follow the natural flow of reasoning. Three guiding principles:

**Observe first, judge second, conclude last.** Data extraction fields (factual, verifiable) go first; analytical judgment fields (requiring reasoning, carrying uncertainty) go in the middle; synthesized conclusion fields go last. This aligns with the natural order of human analytical thinking and provides the richest context for subsequent fields.

**Dependencies before dependents.** If field B's description references field A, then A must be defined before B. This way, A's value already exists when B is being generated, and B's reasoning can genuinely build on A's result.

**Group similar fields together.** Multiple data extraction fields should be placed together; multiple judgment fields should be placed together. The LLM does not have to switch back and forth between different types of cognitive tasks.

```python
from pydantic import BaseModel, Field
from typing import Literal, Optional


class InvestmentReport(BaseModel):
    # Layer 1: Data extraction (factual, verifiable)
    company_name: str = Field(description="Name of the company covered in the report")
    ticker: Optional[str] = Field(
        default=None,
        description="Stock ticker symbol (if available)"
    )
    revenue_millions: Optional[float] = Field(
        default=None, gt=0,
        description="Revenue in millions of USD; null if not mentioned in the source text"
    )

    # Layer 2: Analytical judgment (requires reasoning, carries uncertainty)
    market_position: Literal["leader", "challenger", "niche", "unclear"] = Field(
        description="Market position as assessed from the report content"
    )
    risk_factors: list[str] = Field(
        min_length=0, max_length=5,
        description="Key risk factors mentioned in the report"
    )

    # Layer 3: Synthesized conclusion
    summary: str = Field(
        max_length=500,
        description="Synthesizing the above company_name, revenue_millions, "
                    "market_position, and risk_factors, "
                    "provide a brief summary from an investment perspective"
    )
```

Three progressive layers: first extract the company name and financial data (verifiable by fact-checking), then make qualitative judgments (statistical "correctness"), and finally synthesize all preceding information into a conclusion. Each layer has a different quality standard; once separated into layers, different validation strategies can be applied to each.

## Boundaries of Schema as Workflow

Schema as Workflow, like Code as Prompt, has boundaries of applicability.

**The limitation of linear reasoning.** Field arrangement defines a linear reasoning path: A -> B -> C -> D. When reasoning requires iteration (revising A based on C's result) or branching (taking different reasoning paths depending on B's value), a single model's field arrangement cannot express this. Such complex reasoning needs to be handled at the orchestration layer -- using code logic to control the flow between multiple LLM calls. [Chapter 5](../05-architecture-and-orchestration/00-overview.md) discusses this topic.

**Cognitive load from field count.** The more fields there are, the longer the context the LLM must reference when generating subsequent fields. In practice, a model's top-level fields should not exceed 7-8. Beyond that, consider grouping related fields through nesting -- each nested model becomes a cohesive reasoning sub-unit.

**The boundary of determinism.** Even if the field arrangement perfectly reflects the reasoning logic, LLM output is still probabilistic. Multiple calls to the same model may produce different reasoning paths and conclusions. Schema as Workflow makes reasoning more structured and more predictable, but it does not make the probabilistic nature disappear.
