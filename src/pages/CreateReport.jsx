import React, { useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function CreateReport(){
  const [roomNumber, setRoomNumber] = useState('')
  const [description, setDescription] = useState('')
  const [msg, setMsg] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    setMsg(null)
    setErrors({})
    const err = {}
    if(!roomNumber) err.roomNumber = 'Không được để trống số phòng'
    if(!description || description.length < 10) err.description = 'Mô tả phải ít nhất 10 ký tự'
    if(Object.keys(err).length){ setErrors(err); return }
    setLoading(true)
    try{
      const payload = { roomNumber, description }
      const res = await api.post('/api/v1/report', payload)
      setMsg(res.data.result || 'Thêm thành công')
      nav('/admin/reports')
    }catch(err){
      setMsg(err?.response?.data?.message || 'Error')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded shadow p-6 max-w-lg mx-auto">
      <h3 className="text-lg font-semibold mb-4">Thêm yêu cầu</h3>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm">Số phòng</label>
          <input className="w-full border rounded px-2 py-1" value={roomNumber} onChange={e=>setRoomNumber(e.target.value)} />
          {errors.roomNumber && <div className="text-red-600 text-sm mt-1">{errors.roomNumber}</div>}
        </div>
        <div>
          <label className="block text-sm">Mô tả</label>
          <textarea className="w-full border rounded px-2 py-1" value={description} onChange={e=>setDescription(e.target.value)} />
          {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
        </div>
        {msg && <div className="text-sm text-gray-700">{msg}</div>}
        <div>
          <button disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-green-600'}`}>
            {loading ? 'Thêm...' : 'Thêm'}
          </button>
        </div>
      </form>
    </div>
  )
}
