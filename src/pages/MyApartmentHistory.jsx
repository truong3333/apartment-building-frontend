import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

function decodeUsernameFromToken(token){
  if(!token) return null
  try{
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4
    const padded = pad ? b64 + '='.repeat(4 - pad) : b64
    const payload = JSON.parse(atob(padded))
    return payload.username || payload.sub || payload.preferred_username || payload.name || null
  }catch(e){
    return null
  }
}

export default function MyApartmentHistory(){
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token){ navigate('/login'); return }
    const username = decodeUsernameFromToken(token)
    if(!username){ navigate('/login'); return }

    api.get(`/api/v1/apartment-history/myApartmentHistory/${encodeURIComponent(username)}`)
      .then(r => setList(r.data.result || []))
      .catch(e => {
        console.error(e)
        setError('Không thể tải lịch sử căn hộ')
      })
      .finally(()=> setLoading(false))
  },[navigate])

  if(loading) return <div className="p-6">Loading...</div>
  if(error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="bg-white rounded shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Lịch sử căn hộ của tôi</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Phòng</th>
              <th className="p-2">Bắt đầu</th>
              <th className="p-2">Kết thúc</th>
              <th className="p-2">Đại diện</th>
              <th className="p-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {list && list.length ? list.map((h, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{h.roomNumber}</td>
                <td className="p-2">{h.startDate}</td>
                <td className="p-2">{h.endDate || '-'}</td>
                <td className="p-2">{h.isRepresentative ? 'Có' : 'Không'}</td>
                <td className="p-2">{h.status}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="p-2 text-gray-500">Không có lịch sử</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
