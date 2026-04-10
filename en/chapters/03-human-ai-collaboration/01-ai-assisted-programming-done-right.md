---
originalLink: /chapters/03-人机协作的软件过程/01-AI辅助编程的正确姿势
---

# AI-Assisted Programming Done Right

## The Common Misconception About Collaboration Models

The popular narrative describes AI-assisted programming as "AI writes code, humans review." This model is wrong from the start -- it treats human-AI collaboration as two stations on an assembly line, one for production, one for quality control.

Effective collaboration is actually layered control. Humans define structure and constraints; AI fills in implementation within the constrained space. Humans own the "what" and "why"; AI owns the "how." Put simply: humans make decisions, AI executes.

This layered model is the same structure discussed in [Chapter 4](../04-declarative-prompts-and-type-contracts/01-from-imperative-to-declarative.md) on the imperative-to-declarative leap -- developers declare intent and constraints, and AI generates implementations that satisfy those constraints.

## Three Collaboration Modes and Their Boundaries

In practice there are three collaboration modes, with very different applicable scenarios and trust boundaries.

**Completion mode.** AI predicts the next few lines within existing code context. This is the highest-trust mode because the constraint space is smallest -- function signatures, type annotations, and context variables have already drastically narrowed the possible output. Completion mode turns ideas into code faster. When function signatures and types are already declared, completing the function body is a highly constrained task, and AI accuracy in this scenario far exceeds that of open-ended generation.

**Generation mode.** AI generates code from scratch based on natural language descriptions. This is the lowest-trust mode because the constraint space is largest -- a natural language description can correspond to countless implementations. Generation mode should be used as an iterative loop: describe requirements, review output, provide constraints, regenerate. The key is to incrementally add constraints, guiding AI to converge on the correct implementation.

**Refactoring mode.** AI improves code structure while preserving behavior. This is the most risk-controllable mode because "preserve behavior" provides a verifiable hard constraint -- run the same test suite before and after, accept if it passes, reject if it does not. Refactoring mode solves the thing developers least want to do manually: cleaning up code that works but is structurally messy.

The common pattern across all three modes: **the stronger the constraints, the more trustworthy AI output becomes.** The logic is straightforward -- constraints shrink the output space, and a smaller output space means a lower proportion of incorrect outputs.

## The Spec-First Workflow

Once you understand the relationship between constraints and trustworthiness, the correct workflow is obvious: write the spec first, then let AI fill in the implementation.

What "spec first" looks like concretely in AI-assisted programming:

```python
from pydantic import BaseModel, Field


class OrderProcessor:
    """Core service for processing e-commerce orders.

    Responsibilities:
    - Validate order data integrity
    - Calculate prices (including discounts and taxes)
    - Generate order confirmations

    Not responsible for:
    - Payment processing (handled by PaymentService)
    - Inventory deduction (handled by InventoryService)
    """

    def calculate_total(
        self,
        items: list["OrderItem"],
        discount: "Discount | None",
        tax_rate: float,
    ) -> "OrderTotal":
        """Calculate the order total.

        Rules:
        1. Calculate item subtotals (unit price * quantity)
        2. Apply discount (if any)
        3. Calculate tax on the post-discount amount
        4. Discount must not reduce total below 0
        """
        ...  # AI fills in here


class OrderItem(BaseModel):
    product_id: str
    unit_price: float = Field(gt=0)
    quantity: int = Field(gt=0, le=999)


class Discount(BaseModel):
    type: str = Field(pattern="^(percentage|fixed)$")
    value: float = Field(gt=0)


class OrderTotal(BaseModel):
    subtotal: float = Field(ge=0)
    discount_amount: float = Field(ge=0)
    tax_amount: float = Field(ge=0)
    total: float = Field(ge=0)
```

Before AI is even invoked, this code already embodies a large number of decisions: the class's responsibility boundary, method signatures, input/output type definitions, documented business rules, and declared numeric constraints. All that is left for AI is implementing the calculation logic within these constraints -- a highly constrained task where the type system and business rule documentation compress AI's room for error to a minimum.

Type annotations and docstrings serve as context for both humans and AI. They are a form of implicit prompt -- telling AI what constraints the output must satisfy. [Chapter 4](../04-declarative-prompts-and-type-contracts/02-code-as-prompt.md) discusses this "constraint propagation" in more detail.

## Context Engineering: The Underestimated Key Variable

The quality bottleneck in AI-assisted programming is context quality. Give the same model a codebase with no type annotations, no documentation, and vague naming, versus a codebase with complete types, clear documentation, and precise naming -- the output quality will be worlds apart.

Core operations of context engineering:

**Type annotations are the most efficient context.** A `def process(data: list[dict]) -> dict` gives AI far less information than `def process(orders: list[OrderItem]) -> ProcessingResult`. Type annotations have far higher information density than natural language comments because they are formalized and unambiguous.

**Project-level guidance files are global context.** Files like CLAUDE.md convey design philosophy and decision preferences. A rule like "prefer composition over inheritance" lets AI automatically choose composition patterns when generating code, without repeating the instruction in every interaction.

**Dependencies are implicit constraints.** When AI can see `import` statements and existing utility functions, it will reuse existing abstractions. Keeping related files in the context window is the most effective way to reduce redundant code generation by AI.

## When to Doubt AI's Output

How much to trust AI output depends on the task itself. The experience rules below follow a simple principle -- AI is powerful at pattern matching but fragile at reasoning:

**High-trust scenarios:** Output has clear verification means (can be compiled, can run tests); the task is an instance of a common pattern (CRUD operations, standard algorithm implementations); the constraint space is small (type signatures defined, interface contracts declared).

**Low-trust scenarios:** Involves boundary conditions in business logic (AI lacks business context); involves concurrency, security, distributed consistency, or other domains requiring global reasoning; implementation choices require knowledge beyond the codebase (performance characteristics, deployment environment, organizational constraints).

**Signals that demand immediate review:** AI-generated code introduces new dependencies; AI modifies files it should not have touched; AI's implementation approach is clearly inconsistent with the existing codebase style.

## Prerequisites and Costs

The spec-first workflow has a prerequisite: the developer must be capable of writing good specs -- clear type definitions, accurate responsibility boundaries, complete constraint declarations. This is itself a high-skill requirement. Beginners who do not even know "what types to define" can only use AI-assisted programming as an exploration tool.

Another limitation is cognitive inertia. When AI outputs code that "looks right," human reviewers tend to accept rather than scrutinize. This is a cognitive weakness in humans that technology alone cannot fix. The only mitigation is discipline: apply the same review standards to AI-generated code as to human-written code, never lowering the bar because "it was written by AI, so it should be fine." Between knowing you should review and actually reviewing, there stands the temptation of taking the easy way out.
