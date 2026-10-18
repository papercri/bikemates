import { test as base, expect } from '@playwright/test'
import { mockSupabase, type SupabaseMock } from './supabase-mock'

/**
 * Fixture que instala el mock de Supabase (y de Nominatim/OSM) antes de cada
 * test y lo expone para que el test pueda sembrar datos y cambiar el estado.
 */
export const test = base.extend<{ supabase: SupabaseMock }>({
  supabase: async ({ page }, use) => {
    const mock = await mockSupabase(page)
    await use(mock)
  },
})

export { expect }
