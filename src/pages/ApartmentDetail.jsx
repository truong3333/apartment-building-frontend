import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api'

export default function ApartmentDetail(){
  const { roomNumber } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showAdd, setShowAdd] = useState(false)
  const [newUser, setNewUser] = useState('')
  const [rep, setRep] = useState(false)
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0,10))

  // state update cư dân
  const [showUpdate, setShowUpdate] = useState(false)
  const [endDateUpdate, setEndDateUpdate] = useState('')
  const [updatingUser, setUpdatingUser] = useState(null)
  const [repUpdate, setRepUpdate] = useState(false)

  // state chi tiết user
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  async function fetchData(){
    setLoading(true)
    try{
      const r = await api.get(`/api/v1/apartment/${encodeURIComponent(roomNumber)}`)
      setData(r.data.result)
    }catch(e){
      console.error(e)
      setError('Không thể tải thông tin căn hộ')
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{ fetchData() },[roomNumber])

  // thêm cư dân
  async function handleAddResident(){
    if(!newUser) return alert('Username required')
    try{
      const payload = { roomNumber, username: newUser, isRepresentative: rep, startDate }
      await api.post('/api/v1/apartment-history', payload)
      setShowAdd(false)
      setNewUser('')
      setRep(false)
      fetchData()
    }catch(err){
      console.error(err)
      alert(err?.response?.data || 'Failed to add resident')
    }
  }

  // cập nhật cư dân (chỉ endDate)
  async function handleUpdateResident(){
    try {
        const payload = { 
        roomNumber, 
        username: updatingUser.userResponse?.username, 
        isRepresentative: repUpdate, 
        startDate: updatingUser.startDate, 
        endDate: endDateUpdate || null 
        }
        await api.put('/api/v1/apartment-history', payload)
        setShowUpdate(false)
        setUpdatingUser(null)
        setEndDateUpdate('')
        setRepUpdate(false)
        fetchData()
    }catch(err){
        console.error(err)
        alert(err?.response?.data || 'Failed to update resident')
    }
    }

  // xem chi tiết user
  async function handleViewUser(username){
    try{
      const r = await api.get(`/api/v1/users/${username}`)
      setSelectedUser(r.data.result)
      setShowUserDetail(true)
    }catch(err){
      console.error(err)
      alert('Không lấy được thông tin user')
    }
  }

  function currentMonthly(){
    if(!data?.listMonthlyCost || !data.listMonthlyCost.length) return null
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
    const cm = now.getMonth()+1, cy = now.getFullYear()
    for(const m of data.listMonthlyCost){
      if(m.dateCreate){
        const d = new Date(m.dateCreate)
        if(d.getMonth()+1 === cm && d.getFullYear() === cy) return m
      }
    }
    return data.listMonthlyCost.slice().sort((a,b)=> new Date(b.dateCreate) - new Date(a.dateCreate))[0]
  }

  if(loading) return <div className="p-6">Loading...</div>
  if(error) return <div className="p-6 text-red-600">{error}</div>
  if(!data) return <div className="p-6">No data</div>

  const monthly = currentMonthly()

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">Căn hộ {data.roomNumber}</h3>
          <div className="text-sm text-gray-600">{data.address} • {data.area} m²</div>
        </div>
        <button onClick={()=>setShowAdd(true)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Thêm người ở</button>
      </div>

      {/* Residents */}
      <section className="mt-4">
        <h4 className="font-semibold mb-2">Cư dân đang ở</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Username</th>
                <th className="p-2">Họ tên</th>
                <th className="p-2">Bắt đầu</th>
                <th className="p-2">Người đại diện</th>
                <th className="p-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.listApartmentHistory && data.listApartmentHistory.length ? (
                data.listApartmentHistory.filter(h => h.status === 'action').map(h=> (
                  <tr key={h.userResponse?.username + String(h.startDate)} className="border-t">
                    <td className="p-2">{h.userResponse?.username}</td>
                    <td className="p-2">{h.userResponse?.fullName}</td>
                    <td className="p-2">{h.startDate}</td>
                    <td className="p-2">{h.representative ? '✔' : '❌'}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button onClick={()=>{
                            setUpdatingUser(h)
                            setEndDateUpdate(h.endDate || '')
                            setRepUpdate(h.representative)
                            setShowUpdate(true)
                            }} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                            Cập nhật
                        </button>
                        <button onClick={()=>handleViewUser(h.userResponse?.username)} className="px-2 py-1 bg-gray-600 text-white rounded text-xs">Chi tiết</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="p-2 text-gray-500">No active residents</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Costs */}
      <section className="mt-6">
        <h4 className="font-semibold mb-2">Chi phí tháng hiện tại</h4>
        {monthly ? (
          <div>
            <div className="text-sm text-gray-600 mb-2">
              Ngày tạo: {(monthly.month && monthly.year) ? `${monthly.month}/${monthly.year}` : (monthly.dateCreate ? new Date(monthly.dateCreate).toLocaleDateString() : '')} • Tổng: {monthly.totalAmount} VND
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr><th className="p-2">Loại</th><th className="p-2">Mô tả</th><th className="p-2">Số tiền</th></tr></thead>
                <tbody>
                  {monthly.listCost?.length ? monthly.listCost.map((c,i)=>(
                    <tr key={i} className="border-t">
                      <td className="p-2">{c.type}</td>
                      <td className="p-2">{c.description}</td>
                      <td className="p-2">{c.amount} VND</td>
                    </tr>
                  )) : <tr><td colSpan={3} className="p-2 text-gray-500">No costs</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        ) : <div className="text-gray-500">Không có chi phí tháng hiện tại</div>}
      </section>

      {/* Modal Thêm người ở */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-semibold mb-4">Thêm người ở</h3>
            <label className="block text-sm">Username</label>
            <input value={newUser} onChange={e=>setNewUser(e.target.value)} className="w-full p-2 border rounded mb-2" />
            <label className="flex items-center gap-2 text-sm mb-2"><input type="checkbox" checked={rep} onChange={e=>setRep(e.target.checked)} /> Đại diện</label>
            <label className="block text-sm">Ngày bắt đầu</label>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-full p-2 border rounded mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={()=>setShowAdd(false)} className="px-4 py-2 rounded border">Hủy</button>
              <button onClick={handleAddResident} className="px-4 py-2 rounded bg-blue-600 text-white">Thêm</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Update endDate */}
      {showUpdate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-semibold mb-4">Cập nhật cư dân</h3>

            <label className="flex items-center gap-2 text-sm mb-2">
                <input type="checkbox" checked={repUpdate} onChange={e=>setRepUpdate(e.target.checked)} />
                Đại diện
            </label>

            <label className="block text-sm">Ngày kết thúc</label>
            <input 
                type="date" 
                value={endDateUpdate} 
                onChange={e=>setEndDateUpdate(e.target.value)} 
                className="w-full p-2 border rounded mb-4" 
            />

            <div className="flex justify-end gap-2">
                <button onClick={()=>setShowUpdate(false)} className="px-4 py-2 rounded border">Hủy</button>
                <button onClick={handleUpdateResident} className="px-4 py-2 rounded bg-blue-600 text-white">Lưu</button>
            </div>
            </div>
        </div>
        )}


      {/* Modal User Detail */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-semibold mb-4">Chi tiết người dùng</h3>
            <div className="text-sm space-y-1">
              <div><b>Username:</b> {selectedUser.username}</div>
              <div><b>Họ tên:</b> {selectedUser.fullName}</div>
              <div><b>Email:</b> {selectedUser.email}</div>
              <div><b>SĐT:</b> {selectedUser.phone}</div>
              {/* có thể thêm các field khác nếu UserResponseForAdmin trả về */}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={()=>setShowUserDetail(false)} className="px-4 py-2 rounded border">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
