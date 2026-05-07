import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').order('id', { ascending: true })
    setTasks(data || [])
  }

  async function addTask(e) {
    e.preventDefault()
    if (!newTask) return
    // FIXED: Changed 'task' to 'content' to match your database
    await supabase.from('tasks').insert([{ content: newTask }])
    setNewTask('')
    fetchTasks()
  }

  async function toggleComplete(id, currentState) {
    await supabase
      .from('tasks')
      .update({ is_completed: !currentState })
      .eq('id', id)
    fetchTasks()
  }

  async function deleteTask(id) {
    await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    fetchTasks()
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 font-sans">
      <div className="max-w-xl mx-auto">
        <header className="mb-12 pt-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
            Project Workspace
          </h1>
          <p className="text-gray-500 text-sm">Manage your daily objectives and tracking.</p>
        </header>

        <form onSubmit={addTask} className="flex gap-3 mb-10">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-white border border-gray-200 rounded-md px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
          <button className="bg-black hover:bg-gray-800 text-white text-sm font-medium px-5 py-2 rounded-md transition-all">
            Add Task
          </button>
        </form>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="group bg-white border border-gray-100 p-4 rounded-lg flex justify-between items-center shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div 
                onClick={() => toggleComplete(task.id, task.is_completed)}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${task.is_completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {task.is_completed ? 'Done' : 'Pending'}
                </span>
                {/* FIXED: Changed task.task to task.content */}
                <span className={`text-sm font-medium transition-all ${task.is_completed ? 'text-gray-300 line-through' : 'text-gray-700'}`}>
                  {task.content}
                </span>
              </div>

              <button 
                onClick={() => deleteTask(task.id)}
                className="text-red-400 hover:text-red-600 text-xs font-semibold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App