import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // TODO: Supabase接続 - .env.local に実際の値を設定すること
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
