import type { Page } from '@playwright/test'
import { test as base, expect } from '@playwright/test'
import { mockSupabase, type SupabaseMock } from './supabase-mock'

/**
 * Un único mock por página. El fixture automático lo instala siempre (cualquier
 * petición que escape del mock terminaría en el proyecto real de Supabase), y el
 * fixture `supabase` lo reutiliza para que el test pueda sembrar datos.
 */
const mocksByPage = new WeakMap<Page, SupabaseMock>()

async function installMock(page: Page): Promise<SupabaseMock> {
  const existing = mocksByPage.get(page)

  if (existing) {
    return existing
  }

  const created = await mockSupabase(page)
  mocksByPage.set(page, created)

  return created
}

export const test = base.extend<{ supabase: SupabaseMock }, { autoSupabase: void }>({
  autoSupabase: [
    async ({ page }, use) => {
      await installMock(page)
      await use()
    },
    { auto: true },
  ],
  supabase: async ({ page }, use) => {
    await use(await installMock(page))
  },
})

export { expect }
