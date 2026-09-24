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
    },
  },
]
