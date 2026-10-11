import 'server-only' // quebra o build se alguém importar isto no cliente
import { createClient } from '@supabase/supabase-js'

// Cliente com service_role: ignora RLS. Use SOMENTE em route handlers / server code.
export function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
