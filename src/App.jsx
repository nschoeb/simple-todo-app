import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'

function App() {
  const [session, setSession] = useState(null)
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [newDueDate, setNewDueDate] = useState('')

  // 1. Manage User Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Load tasks when user logs in
  useEffect(() => {
    if (session) {
      fetchTasks()
    }
  }, [session])

  async function fetchTasks() {
    // We sort by id here to keep the list stable
    const { data } = await supabase.from('tasks').select('*').order('id', { ascending: true })
    setTasks(data || [])
  }

  // 3. CRUD Operations
  async function addTask(e) {
    e.preventDefault()
    if (!newTask) return
    
    const payload = { content: newTask }
    if (newDueDate) {
      payload.due_date = newDueDate
    }

    const { error } = await supabase.from('tasks').insert([payload])
    
    if (error) {
      console.error("Error adding task:", error.message)
    } else {
      setNewTask('')
      setNewDueDate('')
      fetchTasks()
    }
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

  // Auth Gatekeeper
  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 font-sans">
      <div className="max-w-xl mx-auto">
        <header className="mb-12 pt-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
              Project Workspace
            </h1>
            <p className="text-gray-500 text-sm">Manage your daily objectives and tracking.</p>
          </div>
          
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-gray-400 hover:text-gray-800 transition-colors mb-1 font-medium"
          >
            Sign out
          </button>
        </header>

        {/* Input Form */}
        <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-3 mb-10">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-white border border-gray-200 rounded-md px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
          
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm shadow-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />

          <button className="bg-black hover:bg-gray-800 text-white text-sm font-medium px-5 py-2 rounded-md transition-all whitespace-nowrap">
            Add Task
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="group bg-white border border-gray-100 p-4 rounded-lg flex justify-between items-center shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div 
                onClick={() => toggleComplete(task.id, task.is_completed)}
                className="flex items-center gap-4 cursor-pointer flex-1"
              >
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${task.is_completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {task.is_completed ? 'Done' : 'Pending'}
                </span>
                
                <div className="flex flex-col">
                  <span className={`text-sm font-medium transition-all ${task.is_completed ? 'text-gray-300 line-through' : 'text-gray-700'}`}>
                    {task.content}
                  </span>
                  {task.due_date && (
                    <span className={`text-xs mt-0.5 font-medium ${task.is_completed ? 'text-gray-300' : 'text-gray-400'}`}>
                      🗓 {new Date(task.due_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                    </span>
                  )}
                </div>
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