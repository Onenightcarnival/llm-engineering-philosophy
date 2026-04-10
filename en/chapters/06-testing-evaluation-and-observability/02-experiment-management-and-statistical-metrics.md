---
originalLink: /chapters/06-测试评估与可观测性/02-实验管理与统计度量
---

# Experiment Management and Statistical Metrics

## The Overlooked Dual Identity

Prompt management is chaotic because a prompt simultaneously has two identities: code and configuration.

It is code because changes to a prompt directly affect system behavior -- the blast radius is no different from modifying a core function. It is configuration because prompts change far more frequently than code, changes are often initiated by non-engineering roles (product managers, domain experts), and the same system may need different prompt variants for different scenarios.

This dual identity means prompts cannot be managed with a purely code-oriented approach (git commit, code review, CI/CD), nor with a purely configuration-oriented approach (config center, hot reload, canary release). They need a combination of both -- ML experiment management solved this problem years ago.

In machine learning, model hyperparameters have the exact same dual identity: they are "code" (directly determining model behavior) and "configuration" (needing frequent adjustment and comparison during experimentation). ML engineers do not hardcode hyperparameters in training scripts and manage changes via git, nor do they dump them into a config file and pray. They use experiment management platforms like MLflow and Weights & Biases to record and correlate every experiment's parameters, results, and environment information.

Prompt engineering needs the same discipline.

## Treat Prompts as Experimental Variables

Upgrading prompt management from "version control" to "experiment management" requires a key cognitive shift: every prompt modification is an experiment. Calling it an "experiment" acknowledges uncertainty -- the new version might be better, or it might be worse, and you need data to judge. The uncertainty management principles from [Chapter 2](../02-uncertainty-and-decisions/00-overview.md) apply directly here: until results are verified, any prompt change is merely a hypothesis.

A proper prompt experiment record includes at least the following elements:

| Record Element | Problem It Solves |
|---------------|-------------------|
| Experiment ID | Unique identifier, links all subsequent analysis |
| Parent version ID | Records "which version this was modified from" -- not knowing the origin of the current version is the most common source of experiment management chaos |
| Hypothesis | Forces the experimenter to articulate expectations before making changes: "what problem is this modification expected to solve" -- a modification without a hypothesis cannot be falsified |
| Prompt content | The core experimental variable |
| Model and parameters | model, temperature, max_tokens, etc. -- environment variables must be held constant, otherwise attribution is impossible |
| Evaluation dataset version | Ensures consistent evaluation benchmarks across experiments -- evaluating with different test sets and drawing incomparable conclusions is another common mistake |
| Evaluation metrics | Quantified results of the experiment |
| Timestamp and author | Traceability |

These fields may seem tedious, but each one corresponds to a problem that recurs in real engineering. Omit any one, and you leave a blind spot in subsequent change tracking and effect attribution.

## Experiment Design: The Discipline of Controlled Variables

The core discipline of ML experiment management is controlling variables: change only one factor per experiment, hold everything else constant. This discipline is routinely violated in prompt iteration.

The typical anti-pattern: modify the prompt wording, upgrade the model version, and adjust the temperature all at once, then discover that output quality changed -- but you cannot attribute which change caused it. In data science, this is a beginner's mistake, but in prompt engineering, nearly everyone commits it.

Operationalizing this is simple: define the experiment configuration (prompt template, model, temperature, max_tokens, system message, etc.) as a structured object, and automatically validate before each experiment that only one field has changed. If multiple fields change simultaneously, split into separate experiments. The value of this constraint is not in its technical complexity -- it is trivially simple -- but in turning discipline into an automated check. The "constraint propagation" principle from [Chapter 4](../04-declarative-prompts-and-type-contracts/00-overview.md) applies here: good constraints are precise models of the problem space.

## Change Tracking and Effect Attribution

Version control answers "what changed." Experiment management answers "what happened after the change." The combination answers the question that actually matters: "is this change worth keeping?"

The minimum standard for effect attribution: for every adopted prompt change, you can state the quantified improvement it produced on the evaluation set, and whether that improvement is statistically significant. A change decision without quantified attribution is essentially rolling dice.

A minimum viable approach in practice does not require a complex platform. A structured JSON Lines file plus a simple Python script can deliver the core functionality: record each experiment's configuration and results, compare metric differences between any two versions, trace the prompt's evolution over time. What matters is the rigor of execution; the tooling just needs to be adequate.

For teams that have reached a certain scale, MLflow's experiment tracking module can be repurposed directly for prompt management. Prompt content is logged as parameters, evaluation metrics as metrics, and prompt files as artifacts. There is no need to build dedicated infrastructure for prompt management -- a decade of ML tooling is more than mature enough.

## Prerequisites and Costs

The experiment management methodology has a fundamental prerequisite: the evaluation function must be stable and trustworthy. If the evaluation itself is unreliable -- vague evaluation criteria, unrepresentative evaluation data, evaluation metrics misaligned with business objectives -- then no amount of experiment management rigor can do more than track noise. The reliability of the evaluation system is the foundation of the entire experiment management framework, and this is where the [next article](./03-from-evaluation-to-observability.md) picks up.

Another limitation is cost. Strict variable control and quantified attribution mean more API calls, longer evaluation cycles, and higher human effort. For exploratory-stage prototypes, the return on investment of this discipline may not justify itself. Strategic direction matters more than analytical detail -- the granularity of experiment management should match the project stage; early prototypes do not need production-grade experiment infrastructure.

## Statistical Metrics for Output Quality

Experiment management solves the tracking problem of "what changed" and "what happened after the change." But to answer "was the change actually an improvement," you need statistical metrics -- transforming the vague "looks good" into quantifiable, comparable indicators.

"Looks good" is not a quality standard. Human subjective judgment of text quality exhibits high variance (the same person's assessment differs at different times), low agreement (different people's assessments differ), and systematic bias (tendency to overrate fluent but incorrect output). The principle established in [Chapter 2](../02-uncertainty-and-decisions/00-overview.md) -- uncertainty is a constraint -- in other words: to manage uncertainty, you must first quantify it.

**Define measurable quality dimensions.** Quality is a multidimensional concept. For most LLM application scenarios, quality dimensions fall roughly into five categories: correctness (is the output factually correct), completeness (does the output cover all required content), format compliance (does the output follow the specified structural and format constraints), consistency (are outputs stable across multiple runs for the same input), and relevance (is the output aligned with the input's intent). Each dimension must be operationalized into computable metrics. Format compliance is the easiest to measure (schema conformance is a binary criterion); correctness and relevance are far harder to measure, often requiring domain expert annotation or LLM-as-Judge methods -- but even imperfect measurement is better than no measurement.

**Establish evaluation baselines.** A baseline is an anchor: all subsequent improvements are measured relative to it. Three things to watch when constructing a baseline: use a fixed evaluation dataset (if you evaluate with different data each time, metric fluctuations cannot be attributed); include statistics from multiple runs, recording mean and standard deviation rather than a single value (LLM output randomness means a single run cannot represent true performance); record environment information (model version, API endpoint, run time), because silent updates from model providers can invalidate the baseline.

**Distinguish signal from noise.** Prompt goes from v1 to v2, accuracy changes from 85% to 88%. Is this a real improvement, or random fluctuation? The core logic of statistical significance testing: assuming no real difference between the two versions, what is the probability that the observed metric difference is purely due to randomness? If that probability is small enough, we have reason to believe the difference is real. The specific test to use depends on the metric type: binary metrics (pass/fail) use a paired binary classification test, continuous metrics (scores) use a paired signed-rank test. A key caveat: when the evaluation dataset is small (fewer than 100 samples), statistical tests have low power -- even real differences may go undetected.

**Common pitfalls.** Using average scores to mask distribution information (85% accuracy might mean "all cases are between 80%-90%," or it might mean "half are 100%, the other half 70%" -- two distributions that call for completely different responses). Repeatedly evaluating on the same dataset and overfitting (the solution is the same as in ML: separate development set and held-out test set). Ignoring alignment between evaluation metrics and business objectives (an accuracy improvement from 90% to 95% that is concentrated on edge cases users do not care about may have zero business value).

The fundamental limitation of statistical metrics: they can only measure quantifiable dimensions. Some quality attributes of LLM output -- whether the tone is appropriate, whether the logic is coherent -- resist reduction to numerical indicators. Moreover, statistical significance is not the same as practical significance -- you need to look at both significance and effect size.
