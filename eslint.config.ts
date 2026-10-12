import { globalIgnores } from 'eslint/config'
import createVueTsConfig from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginPlaywright from 'eslint-plugin-playwright'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['dist/**', 'dist-ssr/**', 'coverage/**']),

  ...pluginVue.configs['flat/essential'],

  // Los primitivos del Design System usan nombres single-word a propósito
  // (Button, Input, Card…), como es habitual en librerías de componentes.
  {
    files: ['src/components/ui/**'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  ...createVueTsConfig({
    supportedScriptLangs: {
      ts: true,
      tsx: true,
      js: true,
      jsx: true,
    },
  }),

  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
]
