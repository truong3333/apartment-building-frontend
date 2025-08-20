import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { Link } from 'react-router-dom'

export default function Users(){
  const [users, setUsers] = useState([])
  const [q, setQ] = useState('')
  const role = localStorage.getItem('role')

  useEffect(()=>{
    load()
  },[])

  function load(){
    api.get('/api/v1/users').then(r=>setUsers(r.data.result || [])).catch(()=>{})
  }

  function filtered(){
    if(!q) return users
    return users.filter(u => (u.username||'').includes(q) || 
    (u.fullName||'').toLowerCase().includes(q.toLowerCase()) || 
    (u.email||'').toLowerCase().includes(q.toLowerCase())  ||
    (u.address || '').toLowerCase().includes(q.toLowerCase()) ||
    (u.dob || '').toLowerCase().includes(q.toLowerCase())
  )}

  // Backend does not expose a DELETE /api/v1/users/{username} endpoint.
  // Deleting users must be done from the backend admin tools. Hide delete action in UI.

  return (
    <div className="bg-white rounded shadow p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Quản lý người dùng</h3>
        <div className="flex items-center gap-3">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm kiếm" className="border px-2 py-1 rounded text-sm" />
        </div>
      </div>

      <table className="w-full text-sm table-auto">
        <thead>
          <tr className="text-left">
            <th className="p-2">Username</th>
            <th className="p-2">Họ tên</th>
            <th className="p-2">Email</th>
            <th className="p-2">Địa chỉ</th>
            <th className="p-2">Số CMND</th>
            <th className="p-2">Ngày sinh</th>
            <th className="p-2">Giới tính</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Vai trò</th>
          </tr>
        </thead>
        <tbody>
          {filtered().map(u => (
            <tr key={u.username} className="border-t">
              <td className="p-2 align-top">{u.username}</td>
              <td className="p-2 align-top">{u.fullName}</td>
              <td className="p-2 align-top">{u.email}</td>
              <td className="p-2 align-top">{u.address}</td>
              <td className="p-2 align-top">{u.cmnd}</td>
              <td className="p-2 align-top">{u.dob}</td>
              <td className="p-2 align-top">{u.gender}</td>
              <td className="p-2 align-top">{u.phone}</td>
              <td className="p-2 align-top">{u.roles?.map(r=>r.name).join(', ')}</td>
              <td className="p-2 align-top">
                <div className="flex gap-2">
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
