import { defineConfig } from 'vitepress'

const zhNav = [
  { text: '首页', link: '/' },
  { text: '开始阅读', link: '/chapters/00-序章/00-概述' },
]

const zhSidebar = [
  {
    text: '序章：为什么写这本书',
    collapsed: false,
    items: [
      { text: '概述', link: '/chapters/00-序章/00-概述' },
      { text: '不是又一本 prompt 手册', link: '/chapters/00-序章/01-不是又一本提示手册' },
      { text: '个人立场声明', link: '/chapters/00-序章/02-个人立场' },
    ],
  },
  {
    text: '第一章 认识论：大模型的本质与边界',
    collapsed: true,
    items: [
      { text: '概述', link: '/chapters/01-认识论/00-概述' },
      { text: '一次一个 token', link: '/chapters/01-认识论/01-一次一个token' },
      { text: '没有确定性的软件工程', link: '/chapters/01-认识论/02-没有确定性的软件工程' },
    ],
  },
  {
    text: '第二章 不确定性与决策',
    collapsed: true,
    items: [
      { text: '概述', link: '/chapters/02-不确定性与决策/00-概述' },
      { text: '战略大于分析', link: '/chapters/02-不确定性与决策/01-战略大于分析' },
      { text: '不确定性的约束结构', link: '/chapters/02-不确定性与决策/02-不确定性是约束条件' },
    ],
  },
  {
    text: '第三章 人机协作的软件过程',
    collapsed: true,
    items: [
      { text: '概述', link: '/chapters/03-人机协作的软件过程/00-概述' },
      { text: 'AI 辅助编程的正确姿势', link: '/chapters/03-人机协作的软件过程/01-AI辅助编程的正确姿势' },
      { text: '代码审查中的人机分工', link: '/chapters/03-人机协作的软件过程/02-代码审查中的人机分工' },
      { text: '文档驱动开发的复兴', link: '/chapters/03-人机协作的软件过程/03-文档驱动开发的复兴' },
      { text: '知识库作为活的系统规格说明', link: '/chapters/03-人机协作的软件过程/04-知识库作为活的系统规格说明' },
    ],
  },
  {
    text: '第四章 声明式提示与类型契约',
    collapsed: true,
    items: [
      { text: '概述', link: '/chapters/04-声明式提示与类型契约/00-概述' },
      { text: '从命令式到声明式', link: '/chapters/04-声明式提示与类型契约/01-从命令式到声明式' },
      { text: 'Code as Prompt', link: '/chapters/04-声明式提示与类型契约/02-Code-as-Prompt' },
      { text: 'Schema as Workflow', link: '/chapters/04-声明式提示与类型契约/03-Schema-as-Workflow' },
    ],
  },
  {
    text: '第五章 架构与编排',
    collapsed: true,
    items: [
      { text: '概述', link: '/chapters/05-架构与编排/00-概述' },
      { text: 'RAG 的本质', link: '/chapters/05-架构与编排/01-RAG的本质' },
      { text: 'Agent 的结构分解', link: '/chapters/05-架构与编排/02-Agent的结构分解' },
      { text: '胶水层与核心引擎', link: '/chapters/05-架构与编排/03-胶水层与核心引擎' },
      { text: '隐式编排与显式编排', link: '/chapters/05-架构与编排/04-隐式编排与显式编排' },
      { text: '错误传播与补偿机制', link: '/chapters/05-架构与编排/05-错误传播与补偿机制' },
      { text: '编排框架的过度设计', link: '/chapters/05-架构与编排/06-编排框架的过度设计' },
    ],
  },
  {
    text: '第六章 测试、评估与可观测性',
    collapsed: true,
    items: [
      { text: '概述', link: '/chapters/06-测试评估与可观测性/00-概述' },
      { text: '不确定性系统的测试哲学', link: '/chapters/06-测试评估与可观测性/01-不确定性系统的测试哲学' },
      { text: '实验管理与统计度量', link: '/chapters/06-测试评估与可观测性/02-实验管理与统计度量' },
      { text: '从评估到可观测性', link: '/chapters/06-测试评估与可观测性/03-从评估到可观测性' },
      { text: '降级设计与数据飞轮', link: '/chapters/06-测试评估与可观测性/04-降级设计与数据飞轮' },
    ],
  },
  {
    text: '第七章 反模式与陷阱',
    collapsed: true,
    items: [
      { text: '概述', link: '/chapters/07-反模式与陷阱/00-概述' },
      { text: '提示拼接的脆弱性', link: '/chapters/07-反模式与陷阱/01-提示拼接的脆弱性' },
      { text: '模型选择的工程约束', link: '/chapters/07-反模式与陷阱/02-模型选择的工程约束' },
      { text: '能力边界的误判', link: '/chapters/07-反模式与陷阱/03-能力边界的误判' },
      { text: '把不确定性当缺陷', link: '/chapters/07-反模式与陷阱/04-把不确定性当缺陷' },
      { text: '何时从提示转向微调', link: '/chapters/07-反模式与陷阱/05-何时从提示转向微调' },
    ],
  },
  {
    text: '终章：软件工程的下一个形态',
    collapsed: true,
    items: [
      { text: '概述', link: '/chapters/08-终章/00-概述' },
      { text: '范式转换的历史节奏', link: '/chapters/08-终章/01-范式转换的历史节奏' },
      { text: '规格说明的回归', link: '/chapters/08-终章/02-规格说明的回归' },
      { text: '软件工程师的下一个身份', link: '/chapters/08-终章/03-软件工程师的下一个身份' },
      { text: '时光机验证', link: '/chapters/08-终章/04-时光机验证' },
    ],
  },
]

const enNav = [
  { text: 'Home', link: '/en/' },
  { text: 'Start Reading', link: '/en/chapters/00-preface/00-overview' },
]

const enSidebar = [
  {
    text: 'Preface: Why This Book',
    collapsed: false,
    items: [
      { text: 'Overview', link: '/en/chapters/00-preface/00-overview' },
      { text: 'Not Another Prompt Handbook', link: '/en/chapters/00-preface/01-not-another-prompt-handbook' },
      { text: 'Personal Stance', link: '/en/chapters/00-preface/02-personal-stance' },
    ],
  },
  {
    text: 'Ch 1 Epistemology: The Nature and Limits of LLMs',
    collapsed: true,
    items: [
      { text: 'Overview', link: '/en/chapters/01-epistemology/00-overview' },
      { text: 'One Token at a Time', link: '/en/chapters/01-epistemology/01-one-token-at-a-time' },
      { text: 'Software Engineering Without Certainty', link: '/en/chapters/01-epistemology/02-software-engineering-without-certainty' },
    ],
  },
  {
    text: 'Ch 2 Uncertainty and Decision-Making',
    collapsed: true,
    items: [
      { text: 'Overview', link: '/en/chapters/02-uncertainty-and-decisions/00-overview' },
      { text: 'Strategy Over Analysis', link: '/en/chapters/02-uncertainty-and-decisions/01-strategy-over-analysis' },
      { text: 'The Constraint Structure of Uncertainty', link: '/en/chapters/02-uncertainty-and-decisions/02-constraint-structure-of-uncertainty' },
    ],
  },
  {
    text: 'Ch 3 Human-AI Collaborative Development',
    collapsed: true,
    items: [
      { text: 'Overview', link: '/en/chapters/03-human-ai-collaboration/00-overview' },
      { text: 'AI-Assisted Programming Done Right', link: '/en/chapters/03-human-ai-collaboration/01-ai-assisted-programming-done-right' },
      { text: 'Human-AI Division of Labor in Code Review', link: '/en/chapters/03-human-ai-collaboration/02-human-ai-division-in-code-review' },
      { text: 'The Revival of Document-Driven Development', link: '/en/chapters/03-human-ai-collaboration/03-revival-of-document-driven-development' },
      { text: 'Knowledge Bases as Living System Specs', link: '/en/chapters/03-human-ai-collaboration/04-knowledge-bases-as-living-specs' },
    ],
  },
  {
    text: 'Ch 4 Declarative Prompts and Type Contracts',
    collapsed: true,
    items: [
      { text: 'Overview', link: '/en/chapters/04-declarative-prompts-and-type-contracts/00-overview' },
      { text: 'From Imperative to Declarative', link: '/en/chapters/04-declarative-prompts-and-type-contracts/01-from-imperative-to-declarative' },
      { text: 'Code as Prompt', link: '/en/chapters/04-declarative-prompts-and-type-contracts/02-code-as-prompt' },
      { text: 'Schema as Workflow', link: '/en/chapters/04-declarative-prompts-and-type-contracts/03-schema-as-workflow' },
    ],
  },
  {
    text: 'Ch 5 Architecture and Orchestration',
    collapsed: true,
    items: [
      { text: 'Overview', link: '/en/chapters/05-architecture-and-orchestration/00-overview' },
      { text: 'The Essence of RAG', link: '/en/chapters/05-architecture-and-orchestration/01-the-essence-of-rag' },
      { text: 'Structural Decomposition of Agents', link: '/en/chapters/05-architecture-and-orchestration/02-structural-decomposition-of-agents' },
      { text: 'Glue Layers and Core Engines', link: '/en/chapters/05-architecture-and-orchestration/03-glue-layers-and-core-engines' },
      { text: 'Implicit vs Explicit Orchestration', link: '/en/chapters/05-architecture-and-orchestration/04-implicit-vs-explicit-orchestration' },
      { text: 'Error Propagation and Compensation', link: '/en/chapters/05-architecture-and-orchestration/05-error-propagation-and-compensation' },
      { text: 'Over-Engineering Orchestration Frameworks', link: '/en/chapters/05-architecture-and-orchestration/06-over-engineering-orchestration-frameworks' },
    ],
  },
  {
    text: 'Ch 6 Testing, Evaluation, and Observability',
    collapsed: true,
    items: [
      { text: 'Overview', link: '/en/chapters/06-testing-evaluation-and-observability/00-overview' },
      { text: 'Testing Philosophy for Uncertain Systems', link: '/en/chapters/06-testing-evaluation-and-observability/01-testing-philosophy-for-uncertain-systems' },
      { text: 'Experiment Management and Statistical Metrics', link: '/en/chapters/06-testing-evaluation-and-observability/02-experiment-management-and-statistical-metrics' },
      { text: 'From Evaluation to Observability', link: '/en/chapters/06-testing-evaluation-and-observability/03-from-evaluation-to-observability' },
      { text: 'Graceful Degradation and Data Flywheels', link: '/en/chapters/06-testing-evaluation-and-observability/04-graceful-degradation-and-data-flywheels' },
    ],
  },
  {
    text: 'Ch 7 Anti-Patterns and Pitfalls',
    collapsed: true,
    items: [
      { text: 'Overview', link: '/en/chapters/07-anti-patterns-and-pitfalls/00-overview' },
      { text: 'The Fragility of Prompt Concatenation', link: '/en/chapters/07-anti-patterns-and-pitfalls/01-the-fragility-of-prompt-concatenation' },
      { text: 'Engineering Constraints of Model Selection', link: '/en/chapters/07-anti-patterns-and-pitfalls/02-engineering-constraints-of-model-selection' },
      { text: 'Misjudging Capability Boundaries', link: '/en/chapters/07-anti-patterns-and-pitfalls/03-misjudging-capability-boundaries' },
      { text: 'Treating Uncertainty as a Defect', link: '/en/chapters/07-anti-patterns-and-pitfalls/04-treating-uncertainty-as-a-defect' },
      { text: 'When to Move from Prompting to Fine-Tuning', link: '/en/chapters/07-anti-patterns-and-pitfalls/05-when-to-move-from-prompting-to-fine-tuning' },
    ],
  },
  {
    text: 'Epilogue: The Next Form of Software Engineering',
    collapsed: true,
    items: [
      { text: 'Overview', link: '/en/chapters/08-epilogue/00-overview' },
      { text: 'Historical Rhythms of Paradigm Shifts', link: '/en/chapters/08-epilogue/01-historical-rhythms-of-paradigm-shifts' },
      { text: 'The Return of Specifications', link: '/en/chapters/08-epilogue/02-the-return-of-specifications' },
      { text: "The Software Engineer's Next Identity", link: '/en/chapters/08-epilogue/03-the-software-engineers-next-identity' },
      { text: 'Time Machine Verification', link: '/en/chapters/08-epilogue/04-time-machine-verification' },
    ],
  },
]

export default defineConfig({
  title: '大模型应用的工程哲学',
  description: '当软件系统的核心组件从确定性函数变成概率性语言模型，软件工程的基本原则会发生什么变化，又有什么不会变。',

  base: '/llm-engineering-philosophy/',
  srcDir: '..',
  outDir: '.vitepress/dist',

  ignoreDeadLinks: [
    /\/LICENSE$/,
  ],

  srcExclude: [
    'node_modules/**',
    'output/**',
    'docs/**',
    'CLAUDE.md',
  ],

  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: zhNav,
        sidebar: zhSidebar,
        outline: { label: '本页目录' },
        docFooter: { prev: '上一篇', next: '下一篇' },
        footer: {
          message: '采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans" target="_blank">CC BY-NC-SA 4.0</a> 许可协议',
          copyright: 'Copyright © 2026 Chao Li',
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en',
      title: 'LLM Engineering Philosophy',
      description: 'When the core component of a software system shifts from deterministic functions to probabilistic language models, what changes in software engineering principles — and what stays the same.',
      themeConfig: {
        nav: enNav,
        sidebar: enSidebar,
        outline: { label: 'On this page' },
        docFooter: { prev: 'Previous', next: 'Next' },
        footer: {
          message: 'Licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a>',
          copyright: 'Copyright © 2026 Chao Li',
        },
      },
    },
  },

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Onenightcarnival/llm-engineering-philosophy' },
    ],
  },
})
