// Artifacts produced by the eslint.config.mjs generator.
// Keep this file in valid ESM syntax.

import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  {
    // hub-agent 是独立的全栈子项目，有自己的依赖与约定，不参与主站 lint
    ignores: ['dist', 'node_modules', 'playwright-report', 'test-results', 'hub-agent'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        Response: 'readonly',
        fetch: 'readonly',
        crypto: 'readonly',
      },
    },
    rules: {
      'no-redeclare': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // TypeScript 自己就会报未定义标识符（Cannot find name），no-undef 在 TS 文件里
      // 只是重复劳动，还会逼着人维护一份手写的浏览器全局清单（漏一个就假报错）。
      'no-undef': 'off',
      'no-unused-vars': 'off', // handled by @typescript-eslint/no-unused-vars
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // anime.js 只能从 src/core/motion/** 进入。直接 import 会绕过两件事：
      //   1) prefers-reduced-motion 的统一判断
      //   2) 组件卸载时的 scope.revert()
      // 这两件漏掉都不会报错，只会静默出问题 —— 所以钉成护栏而不是写进文档。
      'no-restricted-imports': ['error', {
        paths: [{ name: 'animejs', message: '请从 @core/motion 引入动效能力，不要直接 import animejs。' }],
        patterns: [{ group: ['animejs/*'], message: '请从 @core/motion 引入动效能力，不要直接 import animejs 子路径。' }],
      }],
    },
  },
  {
    // 动效层本身是唯一允许直接 import animejs 的地方
    files: ['src/core/motion/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    // 巡检 / 取证脚本：里面的 window、document 都写在 page.evaluate() 的回调里，
    // 真正的执行环境是浏览器而不是 Node。
    // 用独立一段声明，而不是把浏览器全局开给所有 .mjs —— 那会让 Node 脚本里
    // 拼错的变量名（本该报 no-undef）变成静默通过。
    files: ['scripts/shot-*.mjs', 'scripts/probe-*.mjs'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        getComputedStyle: 'readonly',
        requestAnimationFrame: 'readonly',
        performance: 'readonly',
        Event: 'readonly',
        localStorage: 'readonly',
      },
    },
  },
]
