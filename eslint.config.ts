import { globalIgnores } from 'eslint/config'
import vueTsConfigPackage from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginPlaywright from 'eslint-plugin-playwright'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

// 1. Tipamos dinámicamente el paquete para extraer las funciones de forma segura
const configModule = vueTsConfigPackage as unknown as {
  defineConfigWithVueTs?: (...args: unknown[]) => unknown[]
  vueTsConfigs?: { recommended?: unknown }
}

// 2. Asignamos las constantes resolviendo la versión vieja o la nueva
const defineConfigWithVueTs =
  configModule.defineConfigWithVueTs ||
  (vueTsConfigPackage as unknown as (...args: unknown[]) => unknown[])
const vueTsConfigs = configModule.vueTsConfigs || {}

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  ...(vueTsConfigs.recommended ? [vueTsConfigs.recommended] : []),

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
)
