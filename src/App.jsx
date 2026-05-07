import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'

function App() {
  const [session, setSession] = useState(null)
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newCategory, setNewCategory] = useState('General') // NEW: Category state

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    // Clear the hash from the URL so it looks clean again
    if (session) window.history.replaceState({}, document.title, window.location.pathname);
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) fetchTasks()
  }, [session])

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').order('id', { ascending: true })
    setTasks(data || [])
  }

  async function addTask(e) {
    e.preventDefault()
    if (!newTask) return
    
    const payload = { 
      content: newTask,
      priority: newPriority,
      category: newCategory // NEW: Include category
    }
    if (newDueDate) payload.due_date = newDueDate

    const { error } = await supabase.from('tasks').insert([payload])
    if (!error) {
      setNewTask('')
      setNewDueDate('')
      setNewPriority('medium')
      setNewCategory('General')
      fetchTasks()
    }
  }

  async function toggleComplete(id, currentState) {
    await supabase.from('tasks').update({ is_completed: !currentState }).eq('id', id)
    fetchTasks()
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500'
      case 'low': return 'border-l-4 border-l-blue-400'
      default: return 'border-l-4 border-l-gray-300'
    }
  }

  if (!session) return <Auth />

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 font-sans">
      <div className="max-w-xl mx-auto">
        <header className="mb-12 pt-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Project Workspace</h1>
            <p className="text-gray-500 text-sm">Manage your daily objectives and tracking.</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-sm text-gray-400 hover:text-gray-800 transition-colors mb-1 font-medium">Sign out</button>
        </header>

        <form onSubmit={addTask} className="flex flex-col gap-3 mb-10 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What needs to be done?"
            className="bg-gray-50 border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Due Date</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Category</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Work, Personal"
                className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <button className="bg-black hover:bg-gray-800 text-white text-sm font-medium px-8 py-2 rounded-md transition-all shadow-lg shadow-black/10">Add Task</button>
          </div>
        </form>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className={`group bg-white p-4 rounded-lg flex justify-between items-center shadow-sm hover:shadow-md transition-all ${getPriorityColor(task.priority)}`}>
              <div onClick={() => toggleComplete(task.id, task.is_completed)} className="flex items-center gap-4 cursor-pointer flex-1">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${task.is_completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {task.is_completed ? 'Done' : 'Pending'}
                </span>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold transition-all ${task.is_completed ? 'text-gray-300 line-through' : 'text-gray-800'}`}>{task.content}</span>
                    <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">{task.category}</span>
                  </div>
                  <div className="flex gap-3">
                    {task.due_date && (
                      <span className={`text-[10px] mt-0.5 font-bold uppercase tracking-tight ${task.is_completed ? 'text-gray-300' : 'text-gray-400'}`}>🗓 {new Date(task.due_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
                    )}
                    <span className={`text-[10px] mt-0.5 font-bold uppercase tracking-tight ${task.priority === 'high' ? 'text-red-400' : 'text-gray-400'}`}>{task.priority}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App