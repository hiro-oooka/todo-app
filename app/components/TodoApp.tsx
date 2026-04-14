'use client'

import { useState, useTransition } from 'react'
import { addTodo, toggleTodo, deleteTodo } from '../actions'
import type { Todo } from '../lib/supabase'

export default function TodoApp({ initialTodos }: { initialTodos: Todo[] }) {
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleAdd = () => {
    if (!input.trim()) return
    startTransition(async () => {
      await addTodo(input.trim())
      setInput('')
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">ToDoリスト</h1>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="タスクを入力..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isPending}
          />
          <button
            onClick={handleAdd}
            disabled={isPending}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            追加
          </button>
        </div>

        {initialTodos.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">タスクがありません</p>
        ) : (
          <ul className="space-y-2">
            {initialTodos.map(todo => (
              <li key={todo.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => startTransition(() => toggleTodo(todo.id, !todo.completed))}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
                <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {todo.text}
                </span>
                <button
                  onClick={() => startTransition(() => deleteTodo(todo.id))}
                  className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {initialTodos.length > 0 && (
          <p className="text-xs text-gray-400 text-right mt-4">
            {initialTodos.filter(t => t.completed).length} / {initialTodos.length} 完了
          </p>
        )}
      </div>
    </div>
  )
}
