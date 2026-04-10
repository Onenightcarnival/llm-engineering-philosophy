---
originalLink: /chapters/07-反模式与陷阱/05-何时从提示转向微调
---

# When to Move from Prompting to Fine-Tuning

## An Engineering Decision

Discussions around fine-tuning versus prompt engineering tend to get hijacked by technical preferences. One camp considers fine-tuning to be the "real" technical approach, believing only model training counts as serious engineering. The other camp views prompt engineering as sufficient, considering fine-tuning an unnecessary complication. Both positions start with a conclusion and then hunt for supporting arguments.

This is an engineering problem that calls for a decision framework. The principle established in [Chapter 2](../02-uncertainty-and-decisions/01-strategy-over-analysis.md) applies here: define the decision criteria first, then evaluate options against those criteria.

## The Capability Boundaries of Prompt Engineering

Prompt engineering has clear capability boundaries. Understanding these boundaries is the prerequisite for making the right decision.

What prompt engineering excels at: defining task structure, providing a few examples, constraining output format, injecting domain context. Its core mechanism is leveraging capabilities the model already acquired during pre-training, using context to guide the model into applying those capabilities to a specific task. The ceiling of prompt engineering is therefore determined by the model's pre-trained capabilities -- if the model did not sufficiently learn a certain capability during pre-training, prompt engineering cannot conjure it into existence.

Scenarios where prompt engineering hits its ceiling:

First, style transfer. Requiring the model to consistently produce output in a highly specific linguistic style (such as a particular brand's copywriting tone or a domain's terminological conventions) is difficult to achieve reliably with just a few examples and instruction descriptions in the prompt, especially across long conversations or multi-turn interactions.

Second, tacit knowledge. Some tasks have judgment criteria that are difficult to fully describe with natural language rules but can be implicitly conveyed through large volumes of labeled examples. For instance, risk assessment of legal contracts involves numerous patterns that are impossible to enumerate exhaustively; describing them through rules would cause the prompt to bloat to an unmaintainable degree.

Third, latency and cost constraints. Complex prompts (long system instructions, multiple examples, retrieval-augmented context) consume large numbers of tokens, which directly translate into latency and cost. If the application scenario is latency-sensitive or has very high call volume, prompt bloat becomes an engineering bottleneck.

When you hit these ceilings, fine-tuning becomes an option worth evaluating -- because prompt engineering's capabilities are exhausted at this point.

## The Cost Structure of Fine-Tuning

Fine-tuning is not a free lunch. Its cost is not limited to training itself; the entire lifecycle beyond training is where the real expense lies.

**Data cost.** Fine-tuning requires high-quality training data. "High-quality" means consistent annotations, sufficient coverage, and no systematic bias. Acquiring such a dataset typically requires weeks to months of annotation work. Insufficient data quality is the leading cause of fine-tuning failure -- the model will faithfully learn the noise and biases in the training data.

**Training and experimentation cost.** Hyperparameter selection, data mixing ratios, and number of training epochs all require experimental validation. A single fine-tuning experiment can cost anywhere from tens of dollars to thousands of dollars, depending on model size and data volume. Multiple rounds of experimentation are the norm.

**Maintenance cost.** A fine-tuned model requires ongoing maintenance. When the base model is updated, the fine-tuning may need to be redone. When data distributions shift, the model may need retraining. Performance monitoring of the fine-tuned model requires a dedicated evaluation pipeline. These are all ongoing costs, not one-time investments.

**Opportunity cost.** Engineering resources invested in fine-tuning (data annotation, training experiments, deployment operations) cannot simultaneously be invested in product iteration, architecture optimization, or other potentially higher-return work.

## The Risks of Fine-Tuning

Beyond cost, fine-tuning introduces specific risks that prompt engineering does not have.

**Catastrophic forgetting.** Fine-tuning can cause the model to degrade on other tasks. Fine-tuning to improve contract risk assessment accuracy might inadvertently reduce the model's general summarization capability or instruction-following ability. This damage often surfaces gradually during subsequent usage and is hard to detect at the time fine-tuning is completed.

**Distribution shift.** If training data and production environment inputs differ, the fine-tuned model's performance may fall short of expectations. Worse, a fine-tuned model may excel on in-distribution inputs but perform far worse than the original model on out-of-distribution inputs -- its reliability becomes more dependent on the distribution characteristics of its inputs.

**Debugging difficulty.** The logic of prompt engineering is transparent -- the prompt is text that can be directly read and understood. Behavioral changes in a fine-tuned model are implicit -- what it "remembers," what it "forgets," and how it will behave on new inputs cannot be directly observed, only indirectly inferred through extensive testing.

## Decision Framework

The core principle is: **prompt first, fine-tuning as fallback.** The reason is that the iteration costs of the two are asymmetric -- the cycle time difference between modifying a piece of text and retraining a model is hours versus days. When costs are asymmetric, you should exhaust the low-cost option first.

**Necessary conditions (all must be met before considering fine-tuning):**

1. Prompt engineering has hit its ceiling -- you have quantitative data showing that further prompt optimization has converged.
2. You possess training data of sufficient scale with consistent annotations -- if the annotators themselves cannot agree, what the model learns is just noise. The specific thresholds for data scale and consistency depend on task complexity; there is no universal number.
3. The training data distribution covers the major scenarios of the production environment -- out-of-distribution inputs may actually perform worse after fine-tuning.
4. The team has the engineering capacity to continuously maintain a fine-tuned model -- fine-tuning is not a one-time investment but an ongoing operation.

**Sufficient conditions (after the necessary conditions are met, at least one must hold to justify the investment):**

- There is a significant gap between current quality and the target that prompting cannot bridge -- too small a gap means the marginal return from fine-tuning may not be worth the cost.
- The application is latency-sensitive with high call volume -- in this case, the token cost of long prompts itself becomes an engineering bottleneck, and fine-tuning can achieve the same effect with shorter prompts.

What this framework expresses is the priority ordering of the decision. Necessary conditions take precedence over sufficient conditions, and low-cost options take precedence over high-cost options -- each team needs to determine quantitative thresholds for each condition based on their specific task characteristics.

## The Middle Ground: Few-Shot Learning and Retrieval-Augmented Generation

Between prompt engineering and fine-tuning, there are intermediate options. Few-shot learning embeds carefully selected examples in the prompt, allowing the model to adapt to specific task patterns without modifying its parameters. Retrieval-augmented generation (RAG, discussed in [Chapter 5](../05-architecture-and-orchestration/01-the-essence-of-rag.md)) dynamically retrieves relevant information and injects it into the context, pushing the upper bound of prompt engineering higher without bearing the cost and risk of fine-tuning.

These intermediate options are frequently overlooked. A problem that appears to "require fine-tuning" may be solvable through a well-designed RAG pipeline -- externalizing tacit knowledge into a searchable structured knowledge base is more controllable than baking it into model weights. Feedback data from a data flywheel can likewise be used to continuously optimize retrieval strategies and example selection, rather than necessarily being used for fine-tuning.

## The Time Dimension

LLM providers' model capabilities are continuously improving. A quality target that requires fine-tuning today may be achievable through prompt engineering alone with the next generation of models. This means fine-tuning decisions also involve a temporal trade-off: whether the cost of fine-tuning now will become a sunk cost after a model upgrade. For non-urgent quality gaps, waiting may be a better strategy than fine-tuning.
