'use server'

import { refresh } from 'next/cache'
import { createSupabaseClient } from './lib/supabase'

export async function addTodo(text: string) {
  const supabase = createSupabaseClient()
  await supabase.from('todos').insert({ text })
  refresh()
}

export async function toggleTodo(id: string, completed: boolean) {
  const supabase = createSupabaseClient()
  await supabase.from('todos').update({ completed }).eq('id', id)
  refresh()
}

export async function deleteTodo(id: string) {
  const supabase = createSupabaseClient()
  await supabase.from('todos').delete().eq('id', id)
  refresh()
}
