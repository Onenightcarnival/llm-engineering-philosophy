
# Declarative Chain-of-Thought: Engineering Principles of Code as Prompt

## 1. Introduction: The Engineering Challenges of Prompt Engineering

Since large language models (LLMs) have demonstrated their remarkable capabilities, **Prompt Engineering** has become a critical bridge connecting human intent with model capabilities. However, as application scenarios grow increasingly complex, traditional natural language prompt design faces mounting engineering challenges:

**Lack of Determinism**. The semantic ambiguity of natural language means that identical prompts may produce vastly different output structures in different contexts. This **unpredictability** is particularly pronounced in production environments requiring integration with downstream systems.

**High Maintenance Costs**. When business logic changes, modifying a carefully tuned natural language prompt often requires extensive retesting to ensure no unexpected regressions are introduced. The absence of a formalized **contract relationship** between prompts and their output structures makes refactoring considerably difficult.

**Fragility in Complex Reasoning**. For tasks requiring multi-step reasoning, a single natural language instruction struggles to clearly express the dependency relationships and execution order among subtasks. While **Chain-of-Thought (CoT)** techniques partially alleviate this issue, they essentially guide models to "imitate" reasoning processes through examples, lacking explicit control over reasoning structure.

This article introduces an emerging technical paradigm—**Declarative Chain-of-Thought**—and its core principle: **Code As Prompt**. This paradigm attempts to elevate prompt engineering from "craftsmanship" to "software engineering" by introducing type systems and declarative constraints from programming languages.

## 2. From Imperative to Declarative: Philosophical Foundations of Paradigm Shift

Before exploring technical details, we must understand the philosophical motivation behind this paradigm shift. **This transformation is fundamentally another instance of "abstraction level elevation" that has occurred repeatedly in software engineering history, now manifesting in the LLM application domain**.

### 2.1 Imperative Characteristics of Traditional Prompt Engineering

Consider a typical traditional prompt:

```
Please analyze key information in the following text. First identify entities,
then extract relevant attributes, and finally summarize relationships.
Output in JSON format with three fields: entity, attributes, and relations.

[Text to process]
```

This prompt is essentially **imperative**: it describes in detail how the model should proceed (first...then...finally) and attempts to constrain output format through natural language. This approach has several fundamental problems:

1. **Implicit Control Flow**: Although execution order is expressed through "first," "then," etc., this ordering constraint relies on the model's semantic understanding of natural language without enforced guarantees.
2. **Weak Type Constraints**: Requiring "JSON format" and "three fields" represents soft constraints; the model may generate extra fields, missing fields, or fields with unexpected types.
3. **Lack of Reusability**: Such prompts are difficult to decompose and reuse. If another task requires only the "identify entities" portion, directly reusing this prompt fragment is not feasible.

### 2.2 Core Principles of Declarative Chain-of-Thought

The essence of declarative programming lies in **describing "what" rather than "how"**. In SQL, we do not tell the database how to traverse tables or build indexes; we only declare what data we want. In React, we do not describe DOM manipulation steps; we only declare what UI state should be presented.

Declarative Chain-of-Thought introduces this principle into prompt engineering: **Through type systems and structured constraints, declare the expected output structure and dependency relationships among reasoning steps, while delegating the specific reasoning process to the LLM**.

This paradigm shift brings several key advantages:

**Verifiability**: Declarative constraints can be verified through static analysis tools (such as type checkers) before runtime, rather than relying on runtime testing.

**Composability**: Structured definitions can be decomposed into independent modules and composed into complex reasoning chains through reference relationships.

**Maintainability**: Changes in business logic can be precisely localized to corresponding structural definitions without affecting unrelated parts.

## 3. Technical Principles of Declarative Chain-of-Thought

### 3.1 Structure Definition as Reasoning Path

The first core technique of Declarative Chain-of-Thought is **utilizing the definition order of output structure to implicitly define reasoning paths**. This technique fully leverages the essential characteristic of LLMs as **autoregressive models**.

Consider a business scenario: extracting company information from text, including company name, founding year, and business description. Using the Instructor library, we can define:

```python
from pydantic import BaseModel, Field
from typing import Literal
import instructor
from openai import OpenAI

class Company(BaseModel):
    name: str = Field(description="Full company name")
    founding_year: int = Field(description="Founding year, four digits")
    industry: Literal["Technology", "Finance", "Healthcare", "Other"] = Field(
        description="Industry classification"
    )
    description: str = Field(
        description="Based on company name and industry, summarize core business characteristics"
    )

client = instructor.from_openai(OpenAI())

company = client.chat.completions.create(
    model="gpt-4",
    response_model=Company,
    messages=[{"role": "user", "content": "Tesla was founded in 2003..."}]
)
```

In this example, we have not written any "first identify name, then..." instructions. However, due to the token-by-token generation nature of LLMs, it will reason according to the field definition order in the `Company` class:

1. First generate `name` (as it is the first field)
2. Then generate `founding_year` (with `name` already known)
3. Next generate `industry` (with both `name` and `founding_year` known)
4. Finally generate `description` (with all context determined)

The key insight is: **The order of field definitions itself constitutes an implicit chain of thought**. Note particularly the description of the `description` field: "Based on company name and industry"—this explicitly establishes its dependency on preceding fields. Such dependency relationships can only be vaguely expressed in natural language in traditional prompts, whereas here they are clearly manifested through structural definition.

### 3.2 Type System as Constraint Propagation Mechanism

The second core technique is **utilizing the type system of programming languages to achieve precise constraint propagation**. Pydantic's type annotations are not merely static documentation; they are converted to **JSON Schema** at runtime and passed to the LLM.

```python
from pydantic import BaseModel, Field, field_validator
from typing import List

class FinancialMetric(BaseModel):
    year: int = Field(ge=2000, le=2030, description="Fiscal year")
    revenue: float = Field(gt=0, description="Revenue (millions USD)")
    growth_rate: float = Field(
        ge=-100, 
        le=1000,
        description="Growth rate compared to previous year (percentage)"
    )

    @field_validator('growth_rate')
    @classmethod
    def validate_growth_rate(cls, v: float) -> float:
        if abs(v) > 200:
            raise ValueError("Abnormal growth rate, please verify data source")
        return v

class CompanyFinancials(BaseModel):
    company_name: str
    metrics: List[FinancialMetric] = Field(
        min_length=3,
        description="Provide at least three years of financial data, sorted by year ascending"
    )
```

This code demonstrates multi-layered constraint mechanisms:

**Range Constraints**: `year` must be between 2000-2030, `revenue` must be positive. These constraints are declared through `Field` parameters `ge` (greater or equal), `le` (less or equal), `gt` (greater than), and Pydantic automatically converts them to JSON Schema's `minimum`/`maximum` constraints.

**Quantity Constraints**: The `metrics` list must contain at least 3 elements. This ensures the LLM does not generate incomplete data.

**Custom Validation**: The `validate_growth_rate` method implements business logic level validation. While allowing a range of -100% to 1000%, exceeding 200% triggers a warning, which in actual applications could be changed to logging or requesting the LLM to re-reason.

The power of this constraint propagation mechanism lies in: **The constraints themselves are part of the prompt**. When the LLM sees that the `year` field has a `minimum: 2000` constraint in the JSON Schema, it tends to generate reasonable year values. This is far more precise than saying "please ensure year is after 2000" in natural language.

### 3.3 Nested Structures and Recursive Reasoning

The third key technique of Declarative Chain-of-Thought is **achieving recursive reasoning through nested structure definitions**.

```python
from pydantic import BaseModel
from typing import List, Optional

class Argument(BaseModel):
    claim: str = Field(description="Argument statement")
    evidence: List[str] = Field(
        min_length=1,
        description="List of evidence supporting this argument"
    )
    counterargument: Optional['Argument'] = Field(
        default=None,
        description="Counter-argument to this claim (if exists)"
    )
    rebuttal: Optional[str] = Field(
        default=None,
        description="Response to counterargument (only when counterargument exists)"
    )

# To support recursive definition, need to update forward references
Argument.model_rebuild()

class Debate(BaseModel):
    topic: str = Field(description="Debate topic")
    main_argument: Argument = Field(
        description="Main argument and its argumentative structure"
    )
```

This example demonstrates a recursively defined argumentative structure. The `Argument` class can contain a `counterargument` field, which itself is another `Argument` object. This definition allows the LLM to construct an argument tree of arbitrary depth.

More importantly, note the description of the `rebuttal` field: "only when counterargument exists". This expresses a **conditional dependency relationship**: generation of `rebuttal` depends on whether `counterargument` exists. In traditional prompts, such conditional logic is difficult to express clearly; but in declarative definitions, through the `Optional` type and precise field descriptions, this dependency relationship is explicitly encoded.

When the LLM processes such a structure, it will:

1. First generate `claim`
2. Then collect `evidence`
3. Evaluate whether `counterargument` exists
4. If it exists, recursively generate a complete `Argument` structure
5. Finally, decide whether to generate `rebuttal` based on the existence of `counterargument`

This reasoning process is entirely driven by structural definition, requiring no "if counter-argument exists then..." logical branches in the prompt.

## 4. Code as Prompt: The Power of Type Systems

### 4.1 From JSON Schema to Structured Output

The Instructor library supports multiple modes for implementing structured output, including approaches based on **Function Calling**, **prompt injection**, etc. Regardless of the underlying implementation, the core mechanism is converting Pydantic models to some form of structured constraints (such as JSON Schema) and guiding the LLM to generate output conforming to constraints through different strategies.

This conversion can be observed through the following code:

```python
from pydantic import BaseModel
import json

class Person(BaseModel):
    name: str
    age: int

# View generated JSON Schema
schema = Person.model_json_schema()
print(json.dumps(schema, indent=2))
```

Output:

```json
{
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "age": {"type": "integer"}
  },
  "required": ["name", "age"]
}
```

This JSON Schema is passed to the LLM in some form. Essentially, this is a type of **structured prompt injection**: it tells the LLM "you must return JSON conforming to this schema."

This embodies a profound insight: **Type definitions themselves are a highly structured natural language**. When we write `age: int`, it is equivalent to telling the LLM "the age field must be an integer." But unlike natural language, this "language" has precise syntax and semantics, with no ambiguity.

### 4.2 Literal Types: Enumeration as Prompt

**Literal types** play a special role in Declarative Chain-of-Thought. They are not merely type constraints but also a form of **explicit option prompting**.

```python
from typing import Literal
from pydantic import BaseModel, Field

class SentimentAnalysis(BaseModel):
    text: str = Field(description="Text to be analyzed")
    sentiment: Literal["positive", "negative", "neutral"] = Field(
        description="Sentiment orientation of text"
    )
    confidence: float = Field(
        ge=0.0, 
        le=1.0,
        description="Confidence level of judgment"
    )
    reasoning: str = Field(
        description="Based on text content and sentiment judgment, explain why this conclusion was reached"
    )
```

When Literal types are converted to JSON Schema, they generate `enum` constraints:

```json
{
  "sentiment": {
    "enum": ["positive", "negative", "neutral"],
    "type": "string"
  }
}
```

This is a strong signal to the LLM: it does not need to "create" sentiment classifications but only select from the three given options. This significantly reduces output uncertainty.

Furthermore, Literal can be used to implement **decision-tree style reasoning**:

```python
from typing import Literal, Union
from pydantic import BaseModel, Field

class TextClassification(BaseModel):
    category: Literal["question", "statement", "command"]

class QuestionAnalysis(BaseModel):
    classification: Literal["question"] 
    question_type: Literal["what", "why", "how", "when", "where", "who"]
    requires_domain_knowledge: bool

class StatementAnalysis(BaseModel):
    classification: Literal["statement"]
    is_factual: bool
    contains_opinion: bool

class CommandAnalysis(BaseModel):
    classification: Literal["command"]
    urgency: Literal["high", "medium", "low"]

ResponseType = Union[QuestionAnalysis, StatementAnalysis, CommandAnalysis]
```

This example demonstrates how to use type systems to express branching structures in business logic. While Instructor currently has limited support for Union types, this approach itself is a natural extension of the declarative paradigm: **expressing branching structures of business logic through type composition**.

### 4.3 Field Descriptions: Semantically Enhanced Type Annotations

The `description` parameter of `Field` is the key bridge connecting type systems with natural language. A good description should:

**Clarify Contextual Dependencies**:

```python
class Report(BaseModel):
    title: str = Field(description="Report title")
    executive_summary: str = Field(
        description="Based on detailed content below, distill core insights (no more than 3 sentences)"
    )
    detailed_content: str = Field(description="Report body content")
```

Note the counter-intuitive design here: `executive_summary` is defined before `detailed_content`. This means when the LLM generates the summary, it has not yet generated the detailed content. This ordering is logically incorrect.

The correct approach is:

```python
class Report(BaseModel):
    title: str = Field(description="Report title")
    detailed_content: str = Field(description="Report body content")
    executive_summary: str = Field(
        description="Based on the above detailed_content, distill core insights (no more than 3 sentences)"
    )
```

Now, generation of `executive_summary` naturally depends on `detailed_content`, which is explicitly stated in the description ("Based on the above"), and the field order ensures this dependency is satisfied during generation.

**Provide Generation Guidance**:

```python
class CodeReview(BaseModel):
    code_snippet: str = Field(description="Code snippet to review")
    issues: List[str] = Field(
        min_length=0,
        description="List of identified code issues. Return empty list if code has no issues."
    )
    suggestions: List[str] = Field(
        description="Improvement suggestions. Even without serious issues, provide optimization directions."
    )
```

Here, the empty list case is explicitly explained, preventing the LLM from being confused when "no issues" exist.

**Avoid Over-Constraining**:

```python
# Poor practice
class BadExample(BaseModel):
    summary: str = Field(
        description="Summarize text, must start with 'In conclusion', contain 3 points, each no more than 20 words, separated by semicolons"
    )

# Better practice
class BetterExample(BaseModel):
    summary: str = Field(
        description="Concisely summarize core insights of text"
    )
    key_points: List[str] = Field(
        min_length=1,
        max_length=5,
        description="List of extracted key points"
    )
```

The first example attempts to describe complex format requirements in natural language, violating the intent of the declarative paradigm. The second example achieves the same goal through **structural separation** (`summary` and `key_points`) and **type constraints** (length limits on `List`), but more clearly and verifiably.

## 5. Implicit Workflow Definition Mechanism

### 5.1 Physical Topology as Logical Topology

An elegant characteristic of Declarative Chain-of-Thought is **elimination of explicit workflow orchestration code**. In traditional LLM application development, complex tasks often require frameworks like LangChain to define task DAGs (Directed Acyclic Graphs):

```python
# Traditional approach (pseudocode)
chain = (
    ExtractEntityStep() 
    | ClassifyEntityStep() 
    | EnrichWithKnowledgeBase() 
    | GenerateSummary()
)
```

This explicit orchestration has several problems:

1. Workflow logic is coupled with business logic
2. Adding intermediate steps requires modifying orchestration code
3. Difficult to verify correctness of dependencies through static analysis

**Declarative Chain-of-Thought achieves implicit orchestration through structural nesting**:

```python
from pydantic import BaseModel
from typing import List

class Entity(BaseModel):
    name: str = Field(description="Entity name")
    category: Literal["person", "organization", "location"] = Field(
        description="Entity type classification"
    )

class EnrichedEntity(BaseModel):
    entity: Entity = Field(description="Basic entity information")
    aliases: List[str] = Field(
        description="Based on entity's name and category, list possible aliases"
    )
    domain_info: str = Field(
        description="From domain knowledge perspective, supplement entity's background information"
    )

class DocumentAnalysis(BaseModel):
    raw_text: str = Field(description="Original text content")
    entities: List[Entity] = Field(
        description="All entities identified from raw_text"
    )
    enriched_entities: List[EnrichedEntity] = Field(
        description="Enhance each entity in entities list"
    )
    summary: str = Field(
        description="Based on enriched_entities, generate document summary"
    )
```

This structural definition implicitly expresses the following workflow:

1. Preserve original text (`raw_text`)
2. Extract entities from text (`entities`)
3. Enhance each entity (`enriched_entities`, referencing `entities`)
4. Generate summary based on enhanced entities (`summary`, referencing `enriched_entities`)

The key lies in **explicit reference relationships in field descriptions** ("from raw_text," "each entity in entities list," "based on enriched_entities"), combined with **field definition order**. These two elements together form a clear data flow and reasoning flow.

### 5.2 Dependency Inversion: Later Fields Reference Earlier Fields

The core principle of this implicit workflow is **later fields can reference earlier fields but not vice versa**. This is essentially a manifestation of **topological sorting**.

```python
class InvalidExample(BaseModel):
    summary: str = Field(
        description="Generate summary based on detailed_analysis below"
    )
    detailed_analysis: str = Field(
        description="Detailed analysis content"
    )
    # Error: summary references detailed_analysis which has not yet been generated
```

Due to the autoregressive nature of LLMs, `summary` will be generated before `detailed_analysis`, causing the reference to fail. The correct approach is to adjust field order:

```python
class ValidExample(BaseModel):
    detailed_analysis: str = Field(
        description="Detailed analysis content"
    )
    summary: str = Field(
        description="Generate summary based on above detailed_analysis"
    )
```

This constraint may seem to limit flexibility, but actually **enforces unidirectionality of reasoning**, avoiding circular dependencies, which is a valuable property in complex systems.

### 5.3 Optional Fields and Conditional Execution

Through `Optional` types, conditional reasoning branches can be implemented:

```python
from typing import Optional

class SecurityCheck(BaseModel):
    code: str = Field(description="Code to check")
    has_vulnerability: bool = Field(
        description="Determine whether code has security vulnerabilities"
    )
    vulnerability_details: Optional[str] = Field(
        default=None,
        description="If has_vulnerability is True, describe vulnerability type and location in detail"
    )
    severity: Optional[Literal["low", "medium", "high", "critical"]] = Field(
        default=None,
        description="If vulnerability exists, assess its severity"
    )
    recommendation: str = Field(
        description="Security recommendations. If vulnerability exists, provide remediation based on vulnerability_details and severity; otherwise provide general security practice advice"
    )
```

This example demonstrates **declarative expression of if-else logic**:

- `has_vulnerability` is a boolean judgment
- `vulnerability_details` and `severity` are optional, populated only when vulnerability exists
- Generation logic of `recommendation` depends on the state of preceding fields

Although we have not written `if has_vulnerability then ...` code, the LLM, by understanding the conditional semantics in field descriptions ("if...then..."), can correctly execute this conditional logic.

## 6. Best Practices and Engineering Considerations

### 6.1 Design Principles

**Single Responsibility Principle**: Each field should express an independent concept. Avoid mixing multiple pieces of information in one field.

```python
# Poor design
class BadDesign(BaseModel):
    info: str = Field(
        description="Contains entity name, type, and description, comma-separated"
    )

# Good design
class GoodDesign(BaseModel):
    name: str = Field(description="Entity name")
    type: str = Field(description="Entity type")
    description: str = Field(description="Entity description")
```

**Principle of Least Astonishment**: Field order should conform to natural human thought processes. Even if technically feasible, counter-intuitive ordering should be avoided.

```python
# Counter-intuitive order
class CounterIntuitive(BaseModel):
    conclusion: str
    evidence: List[str]
    observation: str

# Natural order
class Intuitive(BaseModel):
    observation: str
    evidence: List[str]
    conclusion: str
```

**Explicit is Better than Implicit**: When dependency relationships are complex, explicitly specify reference relationships in field descriptions.

```python
class ExplicitDependency(BaseModel):
    step1_result: str = Field(description="Analysis result from first step")
    step2_result: str = Field(
        description="Further analysis based on step1_result"
    )
    final_conclusion: str = Field(
        description="Synthesizing step1_result and step2_result, derive final conclusion"
    )
```

### 6.2 Performance Optimization Considerations

While Declarative Chain-of-Thought improves maintainability, it also introduces some performance considerations:

**Token Overhead**: JSON Schema increases prompt length. A complex Pydantic model may convert to hundreds of tokens of Schema. This can be optimized through:

```python
from pydantic import BaseModel, Field, ConfigDict

class OptimizedModel(BaseModel):
    # Use concise descriptions
    name: str = Field(description="Name")  # Rather than "Please extract full name from text"
```

**Multi-turn Interaction vs Single-turn Structured**: For extremely complex tasks, single-shot generation may lead to quality degradation. In such cases, consider splitting the structure into multiple independent models, combining through multi-turn calls:

```python
# Single-turn approach (may be slower)
class ComplexAnalysis(BaseModel):
    step1: Step1Result
    step2: Step2Result
    step3: Step3Result

# Multi-turn approach (may be more reliable)
step1 = client.create(response_model=Step1Result, ...)
step2 = client.create(
    response_model=Step2Result, 
    messages=[..., {"role": "assistant", "content": step1.model_dump_json()}]
)
```

### 6.3 Testing and Validation

A major advantage of Declarative Chain-of-Thought is **testability**. Pydantic models themselves are executable specifications:

```python
import pytest
from pydantic import ValidationError

def test_financial_metric_constraints():
    # Test normal case
    valid_data = {
        "year": 2023,
        "revenue": 100.5,
        "growth_rate": 15.2
    }
    metric = FinancialMetric(**valid_data)
    assert metric.year == 2023

    # Test boundary conditions
    with pytest.raises(ValidationError) as exc_info:
        FinancialMetric(year=1999, revenue=100, growth_rate=10)
    assert "year" in str(exc_info.value)

    # Test custom validators
    with pytest.raises(ValidationError) as exc_info:
        FinancialMetric(year=2023, revenue=100, growth_rate=250)
    assert "Abnormal growth rate" in str(exc_info.value)
```

Such tests can verify correctness of constraint logic without calling the LLM, greatly accelerating development iteration speed.

### 6.4 Version Control and Evolution

Another benefit of structured definitions is **clear version evolution paths**:

```python
# v1 version
class AnalysisV1(BaseModel):
    text: str
    sentiment: Literal["positive", "negative"]

# v2 version: add neutral option
class AnalysisV2(BaseModel):
    text: str
    sentiment: Literal["positive", "negative", "neutral"]  # New
    confidence: float = Field(default=0.5, ge=0, le=1)  # New

# Compatibility adapter
def upgrade_v1_to_v2(v1_data: dict) -> dict:
    v2_data = v1_data.copy()
    v2_data["confidence"] = 0.5  # Default value
    return v2_data
```

Field additions, modifications, and deletions can all be clearly tracked through code diffs, which is difficult to achieve with traditional natural language prompts.

## 7. Limitations and Applicable Scenarios

### 7.1 Current Limitations

Declarative Chain-of-Thought is not a silver bullet and has some inherent limitations:

**Constraints on Creative Tasks**: For tasks requiring highly creative output (such as writing, brainstorming), overly strict structural definitions may limit model performance. In such cases, a hybrid approach may be more appropriate:

```python
class CreativeWriting(BaseModel):
    prompt: str = Field(description="Writing topic")
    style_guide: str = Field(description="Style requirements")
    content: str = Field(
        min_length=500,
        description="Creative content, free expression, but must conform to style_guide"
    )
    # Only constrain minimum length, not content structure
```

**Dependence on Model Capabilities**: Declarative Chain-of-Thought depends on models' ability to understand structured output. Early models performed poorly in this regard, while new-generation models like GPT-4 and Claude show significant improvement. This factor must be considered when selecting models.

**Performance Issues with Complex Nesting**: Excessively deep nested structures (such as the aforementioned recursive argument tree) may lead to significantly increased generation time, and quality of deep nesting may degrade. In practice, nesting depth is typically controlled within 3 levels.

### 7.2 Applicable Scenarios

Declarative Chain-of-Thought is particularly suitable for the following scenarios:

**Data Normalization**: Converting unstructured text to structured data where output format has clear specifications (such as resume parsing, contract element extraction).

**Multi-step Reasoning Tasks**: Tasks requiring clear reasoning order and intermediate results (such as mathematical problem solving, logical reasoning).

**Integration with Downstream Systems Required**: Scenarios where output needs to be consumed by other systems; structured output greatly simplifies integration work.

**High Reliability Requirements**: Domains with high accuracy requirements such as finance and healthcare, where guarantees provided by type systems can reduce risks.

Less suitable scenarios include:

**Pure Conversational Interaction**: Applications like chatbots requiring natural conversation flow should not be overly structured.

**Exploratory Tasks**: Tasks where the output structure itself is uncertain (such as "help me analyze what issues this code might have," where the number and types of issues are unknown beforehand).

**High Real-time Requirements**: Due to Schema overhead and validation processes, latency will be slightly higher than pure text generation.

## 8. Relationship with Related Technologies

### 8.1 Structured Output Implementation Approaches

There are multiple ways to implement structured output, including OpenAI's **Function Calling**, **Structured Output** (JSON Mode), etc. The Instructor library supports multiple modes, allowing selection of the most appropriate implementation based on different models and APIs.

Different implementation approaches all essentially pass structured constraints to the LLM through some mechanism:

- **Function Calling approach**: Define Schema as function signature, utilize model's function calling capability
- **Prompt injection approach**: Directly inject Schema information and format requirements in system prompt
- **JSON Mode**: Enable model's JSON output mode, combined with Schema constraints

### 8.2 Complementarity with Traditional CoT

Declarative Chain-of-Thought does not replace traditional CoT but complements it. The two can be combined:

```python
class MathProblem(BaseModel):
    question: str = Field(description="Mathematical problem statement")
    reasoning_steps: List[str] = Field(
        min_length=1,
        description="Solution steps, each should clearly explain reasoning process (similar to CoT)"
    )
    final_answer: float = Field(
        description="Final answer derived from above reasoning_steps"
    )
```

The `reasoning_steps` field here preserves CoT's free reasoning characteristics, but the overall structure remains declarative.

## 9. Future Outlook

### 9.1 Richer Constraint Expression

Current type systems remain limited. More powerful constraint expression methods may emerge in the future:

```python
# Hypothetical future syntax
class AdvancedModel(BaseModel):
    x: int
    y: int
    z: int = Field(constraint=lambda model: model.z == model.x + model.y)
    # Cross-field algebraic constraints
```

While Pydantic's `model_validator` can achieve similar functionality, expressing it directly at the field level would be more intuitive.

### 9.2 Integration with Symbolic Reasoning

Declarative Chain-of-Thought is essentially a form of **soft constraint** (relying on LLM understanding of Schema). Future developments may combine it with **hard constraints** (formal verification):

```python
class VerifiedOutput(BaseModel):
    theorem: str
    proof: List[str]

    @formal_verifier
    def verify_proof(self):
        # Call theorem prover to verify correctness of proof
        return check_proof(self.theorem, self.proof)
```

This would make LLM-generated output not only format-correct but also logically rigorous.

### 9.3 More Intelligent Structure Inference

Currently, structure definitions require manual writing. Future tools may automatically infer structures from examples:

```
Input: Multiple text samples with corresponding expected outputs
Output: Automatically generated Pydantic model definitions
```

This would lower the barrier to entry for Declarative Chain-of-Thought.

## 10. Conclusion

**Declarative Chain-of-Thought represents an important attempt to evolve prompt engineering from "art" toward "engineering"**. By introducing type systems and declarative constraints from programming languages, it combines the flexibility of natural language with the rigor of formal methods, providing a viable path for building reliable LLM applications.

The core insight of this paradigm is: **Structure as prompt, order as logic (Code as Prompt, Schema as Workflow)**. We no longer need to describe "how to do it" in detail using natural language; we only need to declare "what we want" and implicitly define reasoning paths through field order and type constraints.

Of course, Declarative Chain-of-Thought is not suitable for all scenarios. **It excels in tasks requiring highly structured output and multi-step reasoning**, but for tasks requiring creativity or exploration, traditional natural language prompts may be more appropriate. In practice, hybrid use of both approaches often achieves better results.

As LLM capabilities continue to improve and related tools are continually refined, Declarative Chain-of-Thought has the potential to become one of the standard paradigms for enterprise-grade LLM application development. For teams pursuing maintainability, testability, and high reliability, deeply understanding and mastering this technique will bring significant value.
