import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Singleton: uma única conexão WebSocket por aba.
let client: SupabaseClient | null = null

export function getBrowserClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false }, // app anônimo: sem sessão
        realtime: { params: { eventsPerSecond: 20 } },
      },
    )
  }
  return client
}
