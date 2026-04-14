import { createSupabaseClient } from './lib/supabase'
import TodoApp from './components/TodoApp'

export default async function Home() {
  const supabase = createSupabaseClient()
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true })

  return <TodoApp initialTodos={todos ?? []} />
}
