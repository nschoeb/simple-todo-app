import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    setLoading(false)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else setMessage('Success! You are registered.')
    setLoading(false)
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800 mb-2">Nathaniel's Task Tracker</h1>
        <p className="text-sm text-gray-500 mb-6">Please provide an email that you can access for authentication purposes</p>

        <form className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          
          {message && <div className="text-xs text-red-500 font-medium">{message}</div>}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 bg-black hover:bg-gray-800 text-white text-sm font-medium py-2 rounded-md transition-all disabled:opacity-50"
            >
              {loading ? '...' : 'Log In'}
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-white hover:bg-gray-50 text-black border border-gray-200 text-sm font-medium py-2 rounded-md transition-all disabled:opacity-50"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}