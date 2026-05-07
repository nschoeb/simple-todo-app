import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')

  // This runs as soon as the page loads (The "Read" operation)
  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*')
    setTasks(data || [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    // The "Write" operation
    await supabase.from('tasks').insert([{ content: newTask }])
    setNewTask('')
    fetchTasks() // Refresh the list
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks() // Refresh
  }

  function handleDeleteClick(id) {
    if (window.confirm('Delete this task?')) {
      deleteTask(id)
    }
  }

  async function toggleComplete(id, currentStatus) {
    await supabase.from('tasks')
      .update({ is_completed: !currentStatus })
      .eq('id', id)
    fetchTasks() // Refresh
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>My Full Stack Tasks</h1>
      <form onSubmit={handleSubmit}>
        <input 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
          placeholder="New task..." 
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {tasks.map(task => (
          <li key={task.id} style={{ marginBottom: '8px' }}>
            {task.content}
            <button
              style={{ marginLeft: '12px' }}
              onClick={() => handleDeleteClick(task.id)}
              type="button"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App