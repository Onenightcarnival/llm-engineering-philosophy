---
originalLink: /chapters/06-测试评估与可观测性/03-从评估到可观测性
---

# From Evaluation to Observability

## The Boundary Between Testing and Evaluation Dissolves

In traditional software, testing and evaluation are clearly distinct activities. Testing answers "does the code work according to specification." Evaluation answers "does the product meet user needs." The former is binary (pass/fail), the latter is continuous (good/fair/poor).

In LLM applications, this boundary is dissolving.

When you measure "is the LLM summary's accuracy above 85%," is that testing or evaluation? It has a clear pass/fail criterion (>= 85% passes, < 85% fails) -- like testing. It uses statistical metrics computed over a large sample -- like evaluation. It can run automatically in CI -- like testing. Its criteria may shift with business needs -- like evaluation.

The answer: in LLM applications, evaluation itself is testing. Statistical metrics (accuracy, consistency, hallucination rate) are essentially a continuously running test suite, where each metric corresponds to a quality attribute and each threshold corresponds to a pass condition. Converting evaluation metrics into test assertions is straightforward -- define a threshold for each quality dimension, compute that dimension's metric on the evaluation dataset, and check whether it exceeds the threshold. What makes these tests special: they require a labeled test dataset, results are statistical, and threshold-setting is a business judgment.

## Evaluation Datasets: The Quality Anchor

The quality of evaluation-as-testing depends on the quality of the test dataset.

**Representativeness.** The dataset should cover the input distribution actually seen in production. If 80% of production requests are simple queries, the proportion of simple queries in the dataset should be close to 80%.

**Diversity.** While maintaining representativeness, cover known edge cases and difficult samples. Especially inputs that have previously caused production issues.

**Annotation quality.** The expected output (or quality label) for each sample must be accurate. Low-quality annotations make evaluation results unreliable -- the system is actually performing well but gets marked as failing due to annotation errors, or the system is actually performing poorly but passes due to lenient annotations.

**Maintainability.** The dataset must evolve with business changes. New business scenarios need new test samples; deprecated scenarios need their samples removed. Put the evaluation dataset under version control, managed like code.

## From Offline Evaluation to Online Monitoring

Evaluation should not happen only at release time. Offline evaluation (pre-launch, on a fixed dataset), online evaluation (post-launch, sampling production traffic), and continuous monitoring (real-time metrics and alerts) -- the three are different points on the same line.

Offline evaluation is a quality gate -- a checkpoint that prompt changes or model switches must pass before going live. Online evaluation is the real quality signal under production conditions -- asynchronously sampling and evaluating production traffic without affecting user experience, but providing distribution drift information that a fixed dataset cannot capture. Continuous monitoring is the last real-time defense -- triggering alerts and rollbacks when metrics drop below thresholds.

The critical shift from offline to online: the offline evaluation dataset is fixed; online evaluation faces a real, continuously changing input distribution. Silent updates from model providers, changes in user demographics, quality fluctuations in upstream data -- all of these can cause quality drift, and only online evaluation can catch it.

## Observability for LLM Applications

Traditional software observability focuses primarily on performance (latency, throughput) and health (error rate, availability). LLM applications add a dimension that traditional systems lack entirely: **output quality**.

An HTTP 200 response in a traditional system means success. In an LLM application, HTTP 200 only means the API call did not fail -- the LLM returned well-formed JSON, but the content might be hallucinated, might be off-topic, might have ignored critical constraints. Detecting these "successful failures" requires observability.

The three pillars of observability -- logs, traces, metrics -- have special requirements in LLM applications.

**Logs must capture the full invocation context.** The input prompt (including system prompt and user message), the LLM's raw response, the parsed structured result, and whether validation passed. This information is the only basis for post-hoc quality analysis. Privacy is an inescapable constraint: complete prompts and responses may contain users' sensitive data, so log storage, access control, and retention policies must satisfy data privacy requirements.

**Traces must link the complete call chain.** In multi-step workflows, a single user request may trigger multiple LLM calls, multiple tool calls, and multiple database queries. Distributed tracing connects these operations into a causal chain. Tracing is especially useful in LLM applications because it makes the reasoning process retraceable -- when the final output has a problem, tracing helps you pinpoint which step went wrong: did retrieval return irrelevant documents (the RAG step), did the LLM ignore key information (the generation step), or did a tool return bad data (the tool call step)?

**Metrics must extend to quality dimensions.** Beyond standard operational metrics (latency P50/P99, error rate, throughput), LLM applications need additional quality metrics: structural compliance rate (the proportion of LLM outputs passing schema validation), retry rate (the proportion of calls needing retries to get compliant output), token consumption (distribution of input and output tokens, directly tied to cost), and degradation rate (the proportion of calls triggering degradation logic).

| Dimension | Traditional App Metrics | LLM App Additional Metrics |
|-----------|------------------------|---------------------------|
| Performance | Latency, throughput | Token consumption, reasoning steps |
| Health | Error rate, availability | Structural compliance rate, retry rate, degradation rate |
| Quality | (No equivalent concept) | Semantic accuracy, consistency, hallucination rate |
| Cost | Compute resources | Token cost (by module, by model) |

## Correlating Prompt Versions with Output Quality

An advanced application of observability is correlating prompt versions with output quality. When you modify a prompt and deploy it to production, the observability system should be able to answer: did this change improve output quality?

Implementation: record the prompt's version identifier in every LLM call's log, aggregate quality metrics by version in the metrics system, and compare metric distributions between old and new versions to judge the change's effect. Observability then becomes not just problem detection but optimization guidance -- forming a closed loop with the experiment management discussed in the [previous article](./02-experiment-management-and-statistical-metrics.md): experiment management provides offline change attribution, observability provides online effect verification.

## Cost Observability

Token consumption is the primary operational cost of LLM applications. Cost observability means being able to answer: how many tokens does each functional module consume? What is the cost trend over time? Is there abnormal growth? Which users or request types cost the most?

The approach is simple: after every LLM call, record token consumption as a counter metric tagged by functional module and model. With this data, you can attribute costs by module, detect abnormal growth, and identify high-consumption request types.

Cost monitoring is mandatory. An LLM application without cost monitoring is like an API without rate limiting -- sooner or later, unexpected traffic or usage patterns will blow up the bill.

## The Cost-Benefit of Evaluation

Honestly, high-quality evaluation and observability are expensive. Building annotated datasets requires domain experts' time, running evaluation tests costs LLM API calls, and maintaining observability infrastructure demands sustained engineering investment.

But not having evaluation is more expensive. Without quantified quality standards, every prompt change, every model switch, every architecture adjustment is a blind gamble -- you do not know whether it improved or degraded system quality. The cost of evaluation can be calculated; the cost of not evaluating cannot.
