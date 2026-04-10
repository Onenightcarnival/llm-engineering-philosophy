// Bidirectional mapping between Chinese and English page paths.
// Keys are paths without base prefix; values are the counterpart locale path.

const zhToEn: Record<string, string> = {
  '/': '/en/',
  '/chapters/00-序章/00-概述': '/en/chapters/00-preface/00-overview',
  '/chapters/00-序章/01-不是又一本提示手册': '/en/chapters/00-preface/01-not-another-prompt-handbook',
  '/chapters/00-序章/02-个人立场': '/en/chapters/00-preface/02-personal-stance',
  '/chapters/01-认识论/00-概述': '/en/chapters/01-epistemology/00-overview',
  '/chapters/01-认识论/01-一次一个token': '/en/chapters/01-epistemology/01-one-token-at-a-time',
  '/chapters/01-认识论/02-没有确定性的软件工程': '/en/chapters/01-epistemology/02-software-engineering-without-certainty',
  '/chapters/02-不确定性与决策/00-概述': '/en/chapters/02-uncertainty-and-decisions/00-overview',
  '/chapters/02-不确定性与决策/01-战略大于分析': '/en/chapters/02-uncertainty-and-decisions/01-strategy-over-analysis',
  '/chapters/02-不确定性与决策/02-不确定性是约束条件': '/en/chapters/02-uncertainty-and-decisions/02-constraint-structure-of-uncertainty',
  '/chapters/03-人机协作的软件过程/00-概述': '/en/chapters/03-human-ai-collaboration/00-overview',
  '/chapters/03-人机协作的软件过程/01-AI辅助编程的正确姿势': '/en/chapters/03-human-ai-collaboration/01-ai-assisted-programming-done-right',
  '/chapters/03-人机协作的软件过程/02-代码审查中的人机分工': '/en/chapters/03-human-ai-collaboration/02-human-ai-division-in-code-review',
  '/chapters/03-人机协作的软件过程/03-文档驱动开发的复兴': '/en/chapters/03-human-ai-collaboration/03-revival-of-document-driven-development',
  '/chapters/03-人机协作的软件过程/04-知识库作为活的系统规格说明': '/en/chapters/03-human-ai-collaboration/04-knowledge-bases-as-living-specs',
  '/chapters/04-声明式提示与类型契约/00-概述': '/en/chapters/04-declarative-prompts-and-type-contracts/00-overview',
  '/chapters/04-声明式提示与类型契约/01-从命令式到声明式': '/en/chapters/04-declarative-prompts-and-type-contracts/01-from-imperative-to-declarative',
  '/chapters/04-声明式提示与类型契约/02-Code-as-Prompt': '/en/chapters/04-declarative-prompts-and-type-contracts/02-code-as-prompt',
  '/chapters/04-声明式提示与类型契约/03-Schema-as-Workflow': '/en/chapters/04-declarative-prompts-and-type-contracts/03-schema-as-workflow',
  '/chapters/05-架构与编排/00-概述': '/en/chapters/05-architecture-and-orchestration/00-overview',
  '/chapters/05-架构与编排/01-RAG的本质': '/en/chapters/05-architecture-and-orchestration/01-the-essence-of-rag',
  '/chapters/05-架构与编排/02-Agent的结构分解': '/en/chapters/05-architecture-and-orchestration/02-structural-decomposition-of-agents',
  '/chapters/05-架构与编排/03-胶水层与核心引擎': '/en/chapters/05-architecture-and-orchestration/03-glue-layers-and-core-engines',
  '/chapters/05-架构与编排/04-隐式编排与显式编排': '/en/chapters/05-architecture-and-orchestration/04-implicit-vs-explicit-orchestration',
  '/chapters/05-架构与编排/05-错误传播与补偿机制': '/en/chapters/05-architecture-and-orchestration/05-error-propagation-and-compensation',
  '/chapters/05-架构与编排/06-编排框架的过度设计': '/en/chapters/05-architecture-and-orchestration/06-over-engineering-orchestration-frameworks',
  '/chapters/06-测试评估与可观测性/00-概述': '/en/chapters/06-testing-evaluation-and-observability/00-overview',
  '/chapters/06-测试评估与可观测性/01-不确定性系统的测试哲学': '/en/chapters/06-testing-evaluation-and-observability/01-testing-philosophy-for-uncertain-systems',
  '/chapters/06-测试评估与可观测性/02-实验管理与统计度量': '/en/chapters/06-testing-evaluation-and-observability/02-experiment-management-and-statistical-metrics',
  '/chapters/06-测试评估与可观测性/03-从评估到可观测性': '/en/chapters/06-testing-evaluation-and-observability/03-from-evaluation-to-observability',
  '/chapters/06-测试评估与可观测性/04-降级设计与数据飞轮': '/en/chapters/06-testing-evaluation-and-observability/04-graceful-degradation-and-data-flywheels',
  '/chapters/07-反模式与陷阱/00-概述': '/en/chapters/07-anti-patterns-and-pitfalls/00-overview',
  '/chapters/07-反模式与陷阱/01-提示拼接的脆弱性': '/en/chapters/07-anti-patterns-and-pitfalls/01-the-fragility-of-prompt-concatenation',
  '/chapters/07-反模式与陷阱/02-模型选择的工程约束': '/en/chapters/07-anti-patterns-and-pitfalls/02-engineering-constraints-of-model-selection',
  '/chapters/07-反模式与陷阱/03-能力边界的误判': '/en/chapters/07-anti-patterns-and-pitfalls/03-misjudging-capability-boundaries',
  '/chapters/07-反模式与陷阱/04-把不确定性当缺陷': '/en/chapters/07-anti-patterns-and-pitfalls/04-treating-uncertainty-as-a-defect',
  '/chapters/07-反模式与陷阱/05-何时从提示转向微调': '/en/chapters/07-anti-patterns-and-pitfalls/05-when-to-move-from-prompting-to-fine-tuning',
  '/chapters/08-终章/00-概述': '/en/chapters/08-epilogue/00-overview',
  '/chapters/08-终章/01-范式转换的历史节奏': '/en/chapters/08-epilogue/01-historical-rhythms-of-paradigm-shifts',
  '/chapters/08-终章/02-规格说明的回归': '/en/chapters/08-epilogue/02-the-return-of-specifications',
  '/chapters/08-终章/03-软件工程师的下一个身份': '/en/chapters/08-epilogue/03-the-software-engineers-next-identity',
  '/chapters/08-终章/04-时光机验证': '/en/chapters/08-epilogue/04-time-machine-verification',
}

// Build reverse mapping (en → zh)
const enToZh: Record<string, string> = {}
for (const [zh, en] of Object.entries(zhToEn)) {
  enToZh[en] = zh
}

export { zhToEn, enToZh }
