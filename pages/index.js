import { useState, useEffect } from 'react'

export default function Home() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('todos')
      if (stored) setTodos(JSON.parse(stored))
    } catch (e) {
      console.warn('Could not load todos', e)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos))
    } catch (e) {}
  }, [todos])

  function addTodo() {
    if (!text.trim()) return
    setTodos([...todos, { id: Date.now(), text: text.trim(), done: false }])
    setText('')
  }

  function toggle(id) {
    setTodos(todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function remove(id) {
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div className="container">
      <h1>Todo List</h1>

      <div className="inputRow">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="New todo"
          onKeyDown={e => { if (e.key === 'Enter') addTodo() }}
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul className="list">
        {todos.map(t => (
          <li key={t.id} className={t.done ? 'done' : ''}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              <span>{t.text}</span>
            </label>
            <button className="del" onClick={() => remove(t.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <p className="hint">Todos are saved in localStorage.</p>
    </div>
  )
}
