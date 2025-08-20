import React, { useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function CreateApartment(){
  const [roomNumber, setRoomNumber] = useState('')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [msg, setMsg] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    setMsg(null)
    setErrors({})
    const err = {}
    if(!roomNumber) err.roomNumber = 'Room number is required'
    if(!area || Number(area) <= 0) err.area = 'Area must be positive'
    if(Object.keys(err).length){ setErrors(err); return }
    setLoading(true)
    try{
      const payload = { roomNumber, area: Number(area), address }
      const res = await api.post('/api/v1/apartment', payload)
      setMsg(res.data.result || 'Created')
      nav('/admin/apartments')
    }catch(err){
      setMsg(err?.response?.data?.message || 'Error')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded shadow p-6 max-w-lg mx-auto">
      <h3 className="text-lg font-semibold mb-4">Create Apartment</h3>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm">Room number</label>
          <input className="w-full border rounded px-2 py-1" value={roomNumber} onChange={e=>setRoomNumber(e.target.value)} />
          {errors.roomNumber && <div className="text-red-600 text-sm mt-1">{errors.roomNumber}</div>}
        </div>
        <div>
          <label className="block text-sm">Area (m2)</label>
          <input type="number" min="0" className="w-full border rounded px-2 py-1" value={area} onChange={e=>setArea(e.target.value)} />
          {errors.area && <div className="text-red-600 text-sm mt-1">{errors.area}</div>}
        </div>
        <div>
          <label className="block text-sm">Address</label>
          <input className="w-full border rounded px-2 py-1" value={address} onChange={e=>setAddress(e.target.value)} />
        </div>
        {msg && <div className="text-sm text-gray-700">{msg}</div>}
        <div>
          <button disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-green-600'}`}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
