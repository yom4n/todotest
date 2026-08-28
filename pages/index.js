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
    } catch (e) {
      console.warn('Could not save todos', e)
    }
  }, [todos])

  function addTodo() {
    if (!text.trim()) return
    setTodos([...todos, { id: Date.now(), text: text.trim(), done: false }])
    setText('')
  }

  function toggle(id) {
    // Bug: renamed `.map` -> `.Map` during a refactor (or copy-pasted from
    // a language where it's capitalized) and never caught it -- throws a
    // TypeError the moment a user actually clicks a checkbox. Deliberately
    // client-side-only (an event handler, not the render path) so it's a
    // genuine runtime crash reachable by window.onerror -- see the note
    // in the JSX below about why a render-time bug can't be used here.
    setTodos(todos.Map(t => (t.id === id ? { ...t, done: !t.done } : t)))
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
        {/* NOTE: a render-time bug here (e.g. referencing an undefined
            variable) would NOT be catchable by a React error boundary in
            this app -- Next.js's Pages Router server-renders with React's
            classic renderToString, which does not invoke error boundaries
            for render-phase errors (only the newer streaming SSR APIs do).
            That's why the intentional bug lives in toggle() above instead:
            a real client-side event-handler crash, which window.onerror
            genuinely does catch. */}
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
