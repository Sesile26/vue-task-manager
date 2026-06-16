import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        // Use the TS parser inside <script> blocks of .vue files
        parser: tseslint.parser,
      },
    },
  },

  {
    rules: {
      // `any` must break the lint, as required.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
)
