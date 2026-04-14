import { createSupabaseClient } from './lib/supabase'
import TodoApp from './components/TodoApp'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createSupabaseClient()
  const { data: todos, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) console.error('page select error:', error.message, error.code)

  return <TodoApp initialTodos={todos ?? []} />
}
