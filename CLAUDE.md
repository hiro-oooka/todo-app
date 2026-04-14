@AGENTS.md

# Tech Stack

- **Next.js 16** (App Router)
- **Supabase** (PostgreSQL データベース)
- **Vercel** (デプロイ)
- **Tailwind CSS 4**
- **TypeScript**

---

# Architecture

## データフローの基本パターン

```
[Supabase DB]
    ↑↓ SELECT/INSERT/UPDATE/DELETE
[Server Actions] (app/actions.ts)
    ↕ refresh() でページ再取得
[Server Component] (app/page.tsx) ← Supabase から取得して props に渡す
    ↓ initialXxx={data}
[Client Component] (app/components/XxxApp.tsx) ← UI操作 → Server Actions を呼ぶ
```

## ファイル構成

| ファイル | 役割 |
|---|---|
| `app/page.tsx` | async Server Component。データ取得のみ行いClient Componentにpropsで渡す |
| `app/actions.ts` | `'use server'` ファイル。CRUD操作のServer Actionsを定義 |
| `app/lib/supabase.ts` | Supabaseクライアントの生成と型定義 |
| `app/components/XxxApp.tsx` | `'use client'` Component。UI状態管理とServer Actionsの呼び出し |

## 各ファイルのテンプレート

### app/lib/supabase.ts
```ts
import { createClient } from '@supabase/supabase-js'

// 社内プロキシ対応（開発環境のみ）
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

export type MyRecord = {
  id: string
  // ...フィールドを追加
  created_at: string
}

export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### app/actions.ts
```ts
'use server'

import { refresh } from 'next/cache'
import { createSupabaseClient } from './lib/supabase'

export async function addItem(text: string) {
  const supabase = createSupabaseClient()
  await supabase.from('table_name').insert({ text })
  refresh()
}
```

### app/page.tsx
```ts
import { createSupabaseClient } from './lib/supabase'
import MyApp from './components/MyApp'

export const dynamic = 'force-dynamic'  // Vercelのキャッシュ防止に必須

export default async function Home() {
  const supabase = createSupabaseClient()
  const { data } = await supabase
    .from('table_name')
    .select('*')
    .order('created_at', { ascending: true })

  return <MyApp initialData={data ?? []} />
}
```

### app/components/XxxApp.tsx
```tsx
'use client'

import { useState, useTransition } from 'react'
import { addItem } from '../actions'
import type { MyRecord } from '../lib/supabase'

export default function MyApp({ initialData }: { initialData: MyRecord[] }) {
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleAdd = () => {
    if (!input.trim()) return
    startTransition(async () => {
      await addItem(input.trim())
      setInput('')
    })
  }

  return (
    // UI実装
  )
}
```

---

# Setup Checklist

## 1. Supabase
- [ ] プロジェクト作成（リージョン: Northeast Asia (Tokyo) 推奨）
- [ ] SQL Editor でテーブル作成
- [ ] Project Settings → API から **Project URL** と **anon key** を取得

## 2. ローカル開発
```bash
npm install @supabase/supabase-js
```

`.env.local` をプロジェクトルートに作成（`.gitignore` で除外済み）：
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## 3. Vercel デプロイ
- [ ] GitHub リポジトリをインポート
- [ ] Settings → Environment Variables に以下を追加（**All environments** を選択）
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Deploy → 動作確認

---

# Known Issues

## 社内ネットワークでSupabaseに接続できない
**症状:** `SELF_SIGNED_CERT_IN_CHAIN` エラー  
**原因:** 社内プロキシがSSLインスペクションを行っている  
**対処:** `app/lib/supabase.ts` に以下を追加（テンプレートに組み込み済み）
```ts
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}
```

## Vercelでリロードするとデータが消える
**症状:** タスク追加後リロードすると空になる  
**原因:** Next.js 16 が本番環境でページを静的キャッシュする  
**対処:** `app/page.tsx` に必ず追加（テンプレートに組み込み済み）
```ts
export const dynamic = 'force-dynamic'
```
