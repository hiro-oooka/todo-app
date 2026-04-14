import { createClient } from '@supabase/supabase-js'

// 社内プロキシのSSLインスペクション対応（開発環境のみ）
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

export type Todo = {
  id: string
  text: string
  completed: boolean
  created_at: string
}

export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
