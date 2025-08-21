import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function ResidentApartments(){
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selected, setSelected] = useState(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [userDetail, setUserDetail] = useState(null)
  const navigate = useNavigate()
  function currentMonthlyFor(apartment){
    if(!apartment?.listMonthlyCost || !apartment.listMonthlyCost.length) return null
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
    const cm = now.getMonth()+1, cy = now.getFullYear()
    for(const m of apartment.listMonthlyCost){
      if(m.month && m.year){
        if(m.month === cm && m.year === cy) return m
      }
      if(m.dateCreate){
        const d = new Date(m.dateCreate)
        if(d.getMonth()+1 === cm && d.getFullYear() === cy) return m
      }
    }
    // fallback to latest
    return apartment.listMonthlyCost.slice().sort((a,b)=> new Date(b.dateCreate) - new Date(a.dateCreate))[0]
  }

  useEffect(()=>{ load() }, [])

  function load(){
    setLoading(true)
    api.get('/api/v1/apartment/myApartment')
      .then(r=>{
        setList(r.data.result || [])
      })
      .catch(e=>{
        console.error(e)
        setError('Không thể tải danh sách căn hộ')
      })
      .finally(()=>setLoading(false))
  }

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Căn hộ của tôi</h3>
      </div>

      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="space-y-3">
          {list.length ? list.map(a => (
            <div key={a.roomNumber} className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium">Căn hộ {a.roomNumber}</div>
                <div className="text-sm text-gray-600">{a.address} • {a.area} m²</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{ setSelected(a); setShowDetail(true) }} className="px-3 py-1 bg-sky-600 text-white rounded text-sm">Xem chi tiết</button>
              </div>
            </div>
          )) : (
            <div className="text-gray-500">Bạn hiện không có căn hộ nào</div>
          )}
        </div>
      )}

      {/* User detail modal */}
      {showUserDetail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-semibold mb-4">Chi tiết người dùng</h3>
            {userDetail ? (
              userDetail.error ? (
                <div className="text-red-500">{userDetail.error}</div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div><b>Username:</b> {userDetail.username}</div>
                  <div><b>Họ tên:</b> {userDetail.fullName}</div>
                  <div><b>Email:</b> {userDetail.email}</div>
                  <div><b>SĐT:</b> {userDetail.phone}</div>
                  <div><b>Địa chỉ:</b> {userDetail.address}</div>
                </div>
              )
            ) : (
              <div>Đang tải...</div>
            )}

            <div className="flex justify-end mt-4">
              <button onClick={()=>{ setShowUserDetail(false); setUserDetail(null) }} className="px-4 py-2 rounded border">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal — use selected apartment object (no extra API call) */}
      {showDetail && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded shadow-lg w-full max-w-3xl p-6 overflow-auto max-h-[80vh]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">Căn hộ {selected.roomNumber}</h3>
                <div className="text-sm text-gray-600">{selected.address} • {selected.area} m²</div>
              </div>
              <div>
                <button onClick={()=>{ setShowDetail(false); setSelected(null) }} className="px-3 py-1 bg-gray-200 rounded">Đóng</button>
              </div>
            </div>

            <section className="mt-4">
              <h4 className="font-semibold mb-2">Cư dân đang ở</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="text-left"><th className="p-2">Username</th><th className="p-2">Họ tên</th><th className="p-2">Bắt đầu</th><th className="p-2">Đại diện</th><th className="p-2">Thao tác</th></tr>
                  </thead>
                  <tbody>
                    {selected.listApartmentHistory?.length ? selected.listApartmentHistory.filter(h=>h.status==='action').map((h,idx)=> (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{h.userResponse?.username}</td>
                        <td className="p-2">{h.userResponse?.fullName}</td>
                        <td className="p-2">{h.startDate}</td>
                        <td className="p-2">{h.isRepresentative || h.representative ? '✔' : '❌'}</td>
                            <td className="p-2">
                          <div className="flex gap-2">
                            <button onClick={() => {
                              // use the already-loaded user data inside the apartment payload
                              setShowUserDetail(true)
                              setUserDetail(h.userResponse ? h.userResponse : { error: 'Không lấy được thông tin người dùng' })
                            }} className="px-2 py-1 bg-sky-600 text-white rounded text-xs">Chi tiết</button>
                          </div>
                        </td>
                      </tr>
                    )) : <tr><td colSpan={4} className="p-2 text-gray-500">Không có cư dân</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-4">
                <h4 className="font-semibold mb-2">Chi phí tháng này</h4>
                {(() => {
                  const monthly = currentMonthlyFor(selected)
                  if(!monthly) return <div className="text-gray-500">Không có chi phí tháng</div>
                  return (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Ngày tạo: {(monthly.month && monthly.year) ? `${monthly.month}/${monthly.year}` : (monthly.dateCreate ? new Date(monthly.dateCreate).toLocaleDateString() : '')} • Tổng: {monthly.totalAmount} VND</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm table-auto">
                          <thead>
                            <tr className="text-left"><th className="p-2">Loại</th><th className="p-2">Mô tả</th><th className="p-2 text-right">Số tiền</th></tr>
                          </thead>
                          <tbody>
                            {monthly.listCost?.length ? monthly.listCost.map((c,i)=> (
                              <tr key={i} className="border-t">
                                <td className="p-2">{c.type}</td>
                                <td className="p-2">{c.description}</td>
                                <td className="p-2 text-right">{c.amount} VND</td>
                              </tr>
                            )) : <tr><td colSpan={3} className="p-2 text-gray-500">Không có chi phí</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })()}
            </section>  
          </div>
        </div>
      )}
    </div>
  )
}
