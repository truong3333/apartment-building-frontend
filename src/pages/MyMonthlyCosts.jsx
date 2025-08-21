import React, { useEffect, useState } from 'react'
import api from '../api/api'

export default function MyMonthlyCosts(){
  const [list, setList] = useState([])
  const [q, setQ] = useState('')

  const [selected, setSelected] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(()=>{ load() }, [])

  async function load(){
    try{
      const r = await api.get('/api/v1/monthly-cost/myMonthlyCost')
      setList(r.data.result || [])
      if(selected){
        const found = (r.data.result || []).find(m => m.name === selected.name)
        if(found) setSelected(found)
      }
    }catch(e){ console.error(e) }
  }

  function filtered(){
    if(!q) return list
    return list.filter(m => (m.name||'').toLowerCase().includes(q.toLowerCase()) || String(m.totalAmount).includes(q))
  }

  return (
    <div className="bg-white rounded shadow p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Chi phí tháng của tôi</h3>
        <div>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm kiếm" className="border px-2 py-1 rounded text-sm" />
        </div>
      </div>

      <table className="w-full text-sm table-auto">
        <thead>
          <tr className="text-left">
            <th className="p-2">Tên (Phòng - Tháng - Năm)</th>
            <th className="p-2">Ngày tạo</th>
            <th className="p-2">Tổng số tiền</th>
            <th className="p-2">Trạng thái</th>
            <th className="p-2">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered().map(m => (
            <tr key={m.name} className="border-t">
              <td className="p-2 align-top">{m.name}</td>
              <td className="p-2 align-top">{m.dateCreate}</td>
              <td className="p-2 align-top">{Number(m.totalAmount || 0).toLocaleString()} đ</td>
              <td className="p-2 align-top">{m.statusPayment === 'done' ? '✔' : '❌'}</td>
              <td className="p-2 align-top">
                <div className="flex gap-2">
                  <button onClick={async ()=>{ setSelected(m); setShowDetail(true) }} className="px-3 py-1 bg-sky-500 text-white rounded text-sm">Chi tiết</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDetail && selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Chi tiết: {selected.name}</h4>
              <button onClick={()=>setShowDetail(false)} className="text-gray-600 hover:text-black">✕</button>
            </div>
            <p><strong>Ngày tạo:</strong> {selected.dateCreate}</p>
            <p><strong>Tổng tiền:</strong> {Number(selected.totalAmount || 0).toLocaleString()} đ</p>
            <p><strong>Trạng thái:</strong> {selected.statusPayment === 'done' ? "Đã thanh toán" : 'Chưa thanh toán'}</p>

            <h5 className="font-semibold mt-3 mb-1">Danh sách chi phí:</h5>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Loại</th>
                  <th className="p-2 border">Mô tả</th>
                  <th className="p-2 border">Số tiền</th>
                </tr>
              </thead>
              <tbody>
                {selected.listCost?.map((c,i)=>(
                  <tr key={c.id || i}>
                    <td className="p-2 border">{c.type}</td>
                    <td className="p-2 border">{c.description}</td>
                    <td className="p-2 border">{Number(c.amount || 0).toLocaleString()} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      )}
    </div>
  )
}
