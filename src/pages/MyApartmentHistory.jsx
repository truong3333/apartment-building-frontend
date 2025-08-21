import React, { useEffect, useState } from 'react'
import api from '../api/api'

export default function MyApartmentHistory(){
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')

  async function fetchMine(){
    setLoading(true)
    try{
      const r = await api.get('/api/v1/apartment-history/myApartmentHistory')
      setList(r.data.result || [])
    }catch(e){
      console.error(e)
      setError('Không thể tải lịch sử căn hộ của bạn')
    }finally{ setLoading(false) }
  }

  function filtered(){
    if(!q) return list
    return list.filter(h => (
      (h.roomNumber || '').toString().toLowerCase().includes(q.toLowerCase()) ||
      (h.userResponse?.username || '').toLowerCase().includes(q.toLowerCase()) ||
      (h.userResponse?.fullName || '').toLowerCase().includes(q.toLowerCase()) ||
      (h.startDate || '').toLowerCase().includes(q.toLowerCase()) ||
      (h.endDate || '').toLowerCase().includes(q.toLowerCase())  ||
      (h.status === 'action' ? 'Đang ở' : 'Rời đi' || '').toLowerCase().includes(q.toLowerCase())
    ))
  }

  useEffect(()=>{ fetchMine() }, [])

  if(loading) return <div className="p-6">Đang tải...</div>
  if(error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Lịch sử căn hộ của tôi</h3>
        <div className="flex items-center gap-2">
          <input placeholder="Tìm kiếm" value={q} onChange={e=>setQ(e.target.value)} className="border rounded px-2 py-1" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Phòng</th>
              <th className="p-2">Username</th>
              <th className="p-2">Họ tên</th>
              <th className="p-2">Bắt đầu</th>
              <th className="p-2">Kết thúc</th>
              <th className="p-2">Đại diện</th>
              <th className="p-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered() && filtered().length ? filtered().map((h, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{h.roomNumber}</td>
                <td className="p-2">{h.userResponse?.username}</td>
                <td className="p-2">{h.userResponse?.fullName}</td>
                <td className="p-2">{h.startDate}</td>
                <td className="p-2">{h.endDate || '-'}</td>
                <td className="p-2">{h.representative ? '✔' : '❌'}</td>
                <td className="p-2">{h.status === 'action' ? 'Đang ở' : 'Rời đi'}</td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="p-2 text-gray-500">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
