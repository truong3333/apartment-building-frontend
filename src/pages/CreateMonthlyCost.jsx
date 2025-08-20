import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function CreateMonthlyCost(){
  const [roomNumber, setRoomNumber] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [msg, setMsg] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apartments, setApartments] = useState([])
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    setMsg(null)
    setErrors({})
    // validate
    const err = {}
    if(!roomNumber) err.roomNumber = 'Room is required'
    if(!month || Number(month) < 1 || Number(month) > 12) err.month = 'Month must be 1-12'
    if(!year || Number(year) < 2000) err.year = 'Year must be valid'
    if(Object.keys(err).length){ setErrors(err); return }

    setLoading(true)
    try{
      const payload = { roomNumber, month: Number(month), year: Number(year) }
      const res = await api.post('/api/v1/monthly-cost', payload)
      setMsg(res.data.result || 'Created')
      nav('/admin/monthly-costs')
    }catch(err){
      setMsg(err?.response?.data?.message || 'Error')
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    let mounted = true
    api.get('/api/v1/apartment').then(r=>{
      if(!mounted) return
      setApartments(r.data.result || [])
    }).catch(()=>{})
    return ()=> mounted = false
  },[])

  return (
    <div className="bg-white rounded shadow p-6 max-w-lg mx-auto">
      <h3 className="text-lg font-semibold mb-4">Thêm chi phí tháng</h3>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm">Căn hộ</label>
          <select className="w-full border rounded px-2 py-1" value={roomNumber} onChange={e=>setRoomNumber(e.target.value)}>
            <option value="">-- Chọn căn hộ --</option>
            {apartments.map(a=> (
              <option key={a.roomNumber} value={a.roomNumber}>{a.roomNumber} - {a.name || a.address}</option>
            ))}
          </select>
          {errors.roomNumber && <div className="text-red-600 text-sm mt-1">{errors.roomNumber}</div>}
        </div>
        <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Tháng</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={month}
            onChange={e => setMonth(e.target.value)}
          >
            <option value="">-- Chọn tháng --</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {errors.month && <div className="text-red-600 text-sm mt-1">{errors.month}</div>}
        </div>

        <div>
          <label className="block text-sm">Năm</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={year}
            onChange={e => setYear(e.target.value)}
          >
            <option value="">-- Chọn năm --</option>
            {Array.from({ length: 2030 - 2022 + 1 }, (_, i) => 2022 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {errors.year && <div className="text-red-600 text-sm mt-1">{errors.year}</div>}
        </div>
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
