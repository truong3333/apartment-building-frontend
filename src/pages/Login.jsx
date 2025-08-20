import React, { useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError(null)
    try{
      const res = await api.post('/api/v1/auth/token', { username, password })
      const token = res.data.result.token
      // store token
      localStorage.setItem('token', token)
      // try to decode JWT to find role claim (handle base64url and multiple claim shapes)
      try{
        // base64url -> base64
        const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const pad = b64.length % 4
        const padded = pad ? b64 + '='.repeat(4 - pad) : b64
        const payload = JSON.parse(atob(padded))

        // collect candidate values from common claim names
        const candidates = [payload.roles, payload.authorities, payload.role, payload.scope, payload.scp]
        const expand = (c) => {
          if(!c) return []
          if(Array.isArray(c)) return c.flatMap(x => typeof x === 'string' ? [x] : (x && (x.authority || x.name) ? [x.authority || x.name] : Object.values(x)))
          if(typeof c === 'string'){
            if(c.includes(' ')) return c.split(/\s+/)
            if(c.includes(',')) return c.split(',')
            return [c]
          }
          if(typeof c === 'object') return Object.values(c).map(v => String(v))
          return []
        }

        const flat = candidates.flatMap(expand).filter(Boolean).map(s => String(s).toUpperCase())
        // normalize ROLE_ prefix
        const normalized = flat.map(s => s.replace(/^ROLE_/, ''))
        // prefer ADMIN when present
        let storedRole = 'RESIDENT'
        if(normalized.some(s => s.includes('ADMIN'))) storedRole = 'ADMIN'
        else if(normalized.some(s => s.includes('RESIDENT'))) storedRole = 'RESIDENT'
        localStorage.setItem('role', storedRole)
        if(storedRole === 'ADMIN') navigate('/admin')
        else navigate('/resident')
      }catch(_){
        // fallback: go to resident
        localStorage.setItem('role', 'RESIDENT')
        navigate('/resident')
      }
    }catch(err){
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Sign in</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm">Username</label>
          <input className="w-full border rounded px-3 py-2" value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <button className="bg-sky-600 text-white px-4 py-2 rounded">Sign in</button>
        </div>
      </form>
      <div className="mt-3 text-sm">
        <a href="/register" className="text-sky-600">Create an account</a>
      </div>
    </div>
  )
}
