import React, { useEffect, useState } from 'react'
import api from '../api/api'

export default function Reports(){
  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const role = localStorage.getItem('role')

  // state cho modal edit
  const [editing, setEditing] = useState(null)
  const [dateEnd, setDateEnd] = useState('')
  const [error, setError] = useState('')

  // state cho modal chi tiết user
  const [viewUser, setViewUser] = useState(null) 
  const [userDetail, setUserDetail] = useState(null)

  useEffect(()=>{
    load()
  },[])

  function load(){
    api.get('/api/v1/report')
      .then(r=>setList(r.data.result || []))
      .catch(()=>{})
  }

  function filtered(){
    if(!q) return list
    return list.filter(r => 
      (r.title||'').toLowerCase().includes(q.toLowerCase()) || 
      (r.description||'').toLowerCase().includes(q.toLowerCase())
    )
  }

  // mở modal edit
  function openEdit(report){
    setEditing(report)
    setDateEnd(report.dateEnd || '')
    setError('')
  }

  function save(){
    if (!dateEnd) {
      setError('Ngày kết thúc không được để trống')
      return
    }
    if (new Date(dateEnd) < new Date(editing.dateCreate)) {
      setError('Ngày kết thúc không được trước ngày bắt đầu')
      return
    }
    api.put(`/api/v1/report/${editing.id}`, { dateEnd })
      .then(()=>{
        setEditing(null)
        load()
      })
      .catch(()=> setError('Lỗi khi cập nhật'))
  }

  // mở modal user detail
  function openUserDetail(username){
    setViewUser(username)
    setUserDetail(null)
    api.get(`/api/v1/users/${username}`)
      .then(r=>setUserDetail(r.data.result))
      .catch(()=>setUserDetail({ error: 'Không tải được dữ liệu' }))
  }

  return (
    <div className="bg-white rounded shadow p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Yêu cầu từ cư dân</h3>
        <div className="flex items-center gap-3">
          <input 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
            placeholder="Tìm kiếm" 
            className="border px-2 py-1 rounded text-sm" 
          />
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        {filtered().map(r=> (
          <li key={r.id} className="border-b py-2 flex justify-between items-start">
            <div>
              <div className="font-medium">{r.username} — {r.roomNumber}</div>
              <div className="text-xs text-gray-600">{r.description}</div>
              <div className="text-xs text-gray-500">
                Trạng thái: {r.status === 'done' ? '✔' : '❌'} • {r.dateCreate} {r.dateEnd ? `- ${r.dateEnd}` : ''}
              </div>
            </div>
            <div className="flex gap-2">
              {role === 'ADMIN' && (
                <button 
                  onClick={()=>openEdit(r)} 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                  Sửa
                </button>
              )}
              <button 
                onClick={()=>openUserDetail(r.username)} 
                className="px-3 py-1 bg-sky-500 text-white rounded text-sm">
                Chi tiết
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal edit */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Cập nhật báo cáo</h3>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
              <input 
                type="text" 
                value={editing.dateCreate} 
                disabled 
                className="border px-2 py-1 rounded w-full bg-gray-100" 
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
              <input 
                type="date" 
                value={dateEnd} 
                onChange={e=>setDateEnd(e.target.value)} 
                className="border px-2 py-1 rounded w-full" 
              />
            </div>

            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

            <div className="flex justify-end gap-2">
              <button 
                onClick={()=>setEditing(null)} 
                className="px-4 py-2 bg-gray-300 rounded">
                Hủy
              </button>
              <button 
                onClick={save} 
                className="px-4 py-2 bg-blue-600 text-white rounded">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal user detail */}
      {viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Thông tin người dùng</h3>
            {userDetail ? (
              userDetail.error ? (
                <div className="text-red-500">{userDetail.error}</div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div><b>Username:</b> {userDetail.username}</div>
                  <div><b>Họ tên:</b> {userDetail.fullName}</div>
                  <div><b>Email:</b> {userDetail.email}</div>
                  <div><b>Số điện thoại:</b> {userDetail.phone}</div>
                </div>
              )
            ) : (
              <div>Đang tải...</div>
            )}

            <div className="flex justify-end mt-4">
              <button 
                onClick={()=>setViewUser(null)} 
                className="px-4 py-2 bg-gray-300 rounded">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
