import React, { useEffect, useState } from 'react'
import api from '../api/api'

export default function MyReports(){
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [roomNumber, setRoomNumber] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(()=>{ load() }, [])

  function load(){
    setLoading(true)
    api.get('/api/v1/report/myReport')
      .then(r=> setList(r.data.result || []))
      .catch(e=>{ console.error(e); setError('Không thể tải danh sách yêu cầu') })
      .finally(()=> setLoading(false))
  }

  function submit(e){
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    api.post('/api/v1/report', { roomNumber, description })
      .then(()=>{
        setRoomNumber('')
        setDescription('')
        load()
      })
      .catch(e=>{ console.error(e); setError('Tạo yêu cầu thất bại') })
      .finally(()=> setSubmitting(false))
  }

  return (
    <div className="bg-white rounded shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Yêu cầu của tôi</h3>

      <form onSubmit={submit} className="space-y-3 mb-6">
        <div>
          <label className="block text-sm">Số phòng</label>
          <input value={roomNumber} onChange={e=>setRoomNumber(e.target.value)} className="border rounded px-3 py-2 w-full" required />
        </div>
        <div>
          <label className="block text-sm">Mô tả</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} className="border rounded px-3 py-2 w-full" rows={4} required />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-sky-600 text-white rounded">{submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}</button>
        </div>
      </form>

      <div>
        {loading ? <div>Đang tải...</div> : (
          list.length ? (
            <table className="w-full text-sm table-auto">
              <thead>
                <tr className="text-left"><th className="p-2">Số phòng</th><th className="p-2">Mô tả</th><th className="p-2">Ngày tạo</th><th className="p-2">Trạng thái</th></tr>
              </thead>
              <tbody>
                {list.map(r=> (
                  <tr key={r.id} className="border-t">
                    <td className="p-2">{r.roomNumber}</td>
                    <td className="p-2">{r.description}</td>
                    <td className="p-2">{r.dateCreate}</td>
                    <td className="p-2">{r.status === 'done' ? '✔' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="text-gray-500">Bạn chưa tạo yêu cầu nào</div>
        )}
      </div>
    </div>
  )
}
