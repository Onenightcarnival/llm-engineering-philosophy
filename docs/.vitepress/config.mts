import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '大模型应用开发的工程哲学',
  description: '当软件系统的核心组件从确定性函数变成概率性语言模型，软件工程的基本原则会发生什么变化，又有什么不会变。',

  base: '/awesome-llm-practice/',
  srcDir: '..',
  outDir: '.vitepress/dist',

  ignoreDeadLinks: [
    /\/LICENSE$/,
  ],

  // 排除非内容文件
  srcExclude: [
    'node_modules/**',
    'output/**',
    'docs/**',
    'CLAUDE.md',
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '开始阅读', link: '/chapters/00-序章/00-概述' },
    ],

    sidebar: [
      {
        text: '序章：为什么写这本书',
        items: [
          { text: '概述', link: '/chapters/00-序章/00-概述' },
          { text: '不是又一本提示手册', link: '/chapters/00-序章/01-不是又一本提示手册' },
          { text: '个人立场', link: '/chapters/00-序章/02-个人立场' },
        ],
      },
      {
        text: '第一章 认识论：大模型的本质与边界',
        items: [
          { text: '概述', link: '/chapters/01-认识论/00-概述' },
          { text: '一次一个 token', link: '/chapters/01-认识论/01-一次一个token' },
          { text: '没有确定性的软件工程', link: '/chapters/01-认识论/02-没有确定性的软件工程' },
        ],
      },
      {
        text: '第二章 不确定性与决策',
        items: [
          { text: '概述', link: '/chapters/02-不确定性与决策/00-概述' },
          { text: '战略大于分析', link: '/chapters/02-不确定性与决策/01-战略大于分析' },
          { text: '不确定性是约束条件', link: '/chapters/02-不确定性与决策/02-不确定性是约束条件' },
        ],
      },
      {
        text: '第三章 人机协作的软件过程',
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
        items: [
          { text: '概述', link: '/chapters/04-声明式提示与类型契约/00-概述' },
          { text: '从命令式到声明式', link: '/chapters/04-声明式提示与类型契约/01-从命令式到声明式' },
          { text: '提示与代码的同构性', link: '/chapters/04-声明式提示与类型契约/02-提示与代码的同构性' },
          { text: 'Pydantic 作为提示 DSL', link: '/chapters/04-声明式提示与类型契约/03-Pydantic作为提示DSL' },
          { text: 'Literal 类型与决策空间', link: '/chapters/04-声明式提示与类型契约/04-Literal类型与决策空间' },
          { text: 'JSON Schema 作为契约', link: '/chapters/04-声明式提示与类型契约/05-JSON-Schema作为契约' },
          { text: '验证器作为运行时不变量', link: '/chapters/04-声明式提示与类型契约/06-验证器作为运行时不变量' },
        ],
      },
      {
        text: '第五章 架构与编排',
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
        items: [
          { text: '概述', link: '/chapters/07-反模式与陷阱/00-概述' },
          { text: '提示拼接的脆弱性', link: '/chapters/07-反模式与陷阱/01-提示拼接的脆弱性' },
          { text: '模型选择的工程约束', link: '/chapters/07-反模式与陷阱/02-模型选择的工程约束' },
          { text: '能力边界的误判', link: '/chapters/07-反模式与陷阱/03-能力边界的误判' },
          { text: '把不确定性当缺陷', link: '/chapters/07-反模式与陷阱/04-把不确定性当缺陷' },
          { text: '何时微调而非继续提示', link: '/chapters/07-反模式与陷阱/05-何时微调而非继续提示' },
        ],
      },
      {
        text: '终章：软件工程的下一个形态',
        items: [
          { text: '概述', link: '/chapters/08-终章/00-概述' },
          { text: '范式转换的历史节奏', link: '/chapters/08-终章/01-范式转换的历史节奏' },
          { text: '规格说明的回归', link: '/chapters/08-终章/02-规格说明的回归' },
          { text: '软件工程师的下一个身份', link: '/chapters/08-终章/03-软件工程师的下一个身份' },
          { text: '时光机验证', link: '/chapters/08-终章/04-时光机验证' },
        ],
      },
    ],

    outline: {
      label: '本页目录',
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    footer: {
      message: '采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans" target="_blank">CC BY-NC-SA 4.0</a> 许可协议',
      copyright: 'Copyright © 2026 Chao Li',
    },
  },
})
