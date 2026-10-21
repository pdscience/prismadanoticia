import { createClient } from '@insforge/sdk'

const baseUrl = import.meta.env.VITE_INSFORGE_URL
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY

export const isInsforgeConfigured = Boolean(baseUrl && anonKey)

export const insforge = isInsforgeConfigured
  ? createClient({ baseUrl, anonKey })
  : null

export const useMockData =
  import.meta.env.VITE_USE_MOCK !== 'false' || !isInsforgeConfigured
