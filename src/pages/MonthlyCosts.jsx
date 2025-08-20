import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { Link } from 'react-router-dom'

export default function MonthlyCosts(){
  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const role = localStorage.getItem('role')

  const [selected, setSelected] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  // modal thêm/sửa cost
  const [editingCost, setEditingCost] = useState(null)
  const [form, setForm] = useState({ type:'', description:'', amount:'' })
  const [showCostForm, setShowCostForm] = useState(false)

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    setEditingCost(null)
    setForm({ type:'', description:'', amount:'' })
    setShowCostForm(false)
  }, [selected])

  async function load(){
    try {
      const r = await api.get('/api/v1/monthly-cost')
      setList(r.data.result || [])
      // nếu đang mở chi tiết thì cập nhật lại selected
      if(selected){
        const found = (r.data.result || []).find(m => m.name === selected.name)
        if(found) setSelected(found)
      }
    }catch(e){ console.error(e) }
  }

    async function sendAllEmail(){
    if(!window.confirm("Bạn có chắc muốn gửi email chi phí cho TẤT CẢ các phòng?")) return
    try{
      const now = new Date()
      const payload = { month: now.getMonth()+1, year: now.getFullYear() }
      await api.post('/api/v1/monthly-cost/sendAllEmail', payload)
      alert("Đã gửi email chi phí cho tất cả phòng.")
    }catch(e){
      console.error(e)
      alert("Lỗi khi gửi email tất cả.")
    }
  }

  async function sendEmail(m){
    if(!window.confirm(`Bạn có chắc muốn gửi email chi phí cho phòng ${m.name}?`)) return
    try{
      const [room, month, year] = m.name.split('-')  // tách room, month, year
      const payload = { roomNumber: room, month: Number(month), year: Number(year) }
      await api.post('/api/v1/monthly-cost/sendEmail', payload)
      alert(`Đã gửi email chi phí cho phòng ${room}.`)
    }catch(e){
      console.error(e)
      alert("Lỗi khi gửi email.")
    }
  }

  function handleAddCost(){
    setEditingCost(null)
    setForm({ type:'', description:'', amount:'' })
    setShowCostForm(true)
  }

  function handleEditCost(c){
    setEditingCost(c)
    setForm({ 
      type: c.type, 
      description: c.description, 
      amount: c.amount 
    })
    setShowCostForm(true)
  }

  async function saveCost(){
    try{
      const payload = { 
        ...form, 
        amount: Number(form.amount||0), 
        monthlyCost_Name: selected.name 
      }

      if(editingCost){ 
        payload.id = editingCost.id
        await api.put(`/api/v1/cost`, payload)
      }else{
        await api.post(`/api/v1/cost`, payload)
      }

      // reset
      setEditingCost(null)
      setForm({ type:'', description:'', amount:'' })
      setShowCostForm(false)

      // reload lại danh sách
      load()

    }catch(e){
      console.error(e)
      alert("Có lỗi khi lưu chi phí.")
    }
  }

  async function handleDeleteCost(c){
    if(!window.confirm("Bạn có chắc muốn xoá chi phí này?")) return
    try{
      await api.delete(`/api/v1/cost/${c.id}`)
      load()
    }catch(e){
      console.error(e)
      alert("Xoá thất bại.")
    }
  }

  function filtered(){
    if(!q) return list
    return list.filter(m => 
      (m.name||'').toLowerCase().includes(q.toLowerCase()) || 
      String(m.totalAmount).includes(q)
    )
  }

  async function togglePayment(m){
    if(!window.confirm(`Bạn có chắc muốn đổi trạng thái thanh toán của [${m.name}] không?`)){
      return
    }
    try{
      const payload = { 
        name: m.name, 
        statusPayment: m.statusPayment === 'done' ? 'wait' : 'done' 
      }
      await api.put(`/api/v1/monthly-cost`, payload)
      load()
    }catch(e){ 
      console.error(e) 
      alert("Có lỗi xảy ra, vui lòng thử lại.")
    }
  }



  return (
    <div className="bg-white rounded shadow p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Quản lý chi phí tháng</h3>
        <div className="flex items-center gap-3">
          <input 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
            placeholder="Tìm kiếm" 
            className="border px-2 py-1 rounded text-sm" 
          />
          {role === 'ADMIN' && (
            <>
              <Link 
                to="/admin/monthly-costs/create" 
                className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                Thêm chi phí tháng
              </Link>
              <button 
                onClick={sendAllEmail} 
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm">
                Gửi email chi phí cho tất cả căn hộ
              </button>
            </>
          )}
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
              <td className="p-2 align-top">{m.totalAmount.toLocaleString()} đ</td>
              <td className="p-2 align-top">
                {m.statusPayment === 'done' ? '✔' : '❌'}
              </td>
              <td className="p-2 align-top">
                <div className="flex gap-2">
                  {role === 'ADMIN' && (
                    <>
                      <button 
                        onClick={()=>togglePayment(m)} 
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                        Sửa trạng thái
                      </button>
                      <button 
                        onClick={()=>sendEmail(m)} 
                        className="px-3 py-1 bg-purple-500 text-white rounded text-sm">
                        Gửi email
                      </button>
                    </>
                  )}
                  <button 
                    onClick={async ()=>{
                      setSelected(m)
                      setShowDetail(true)
                    }} 
                    className="px-3 py-1 bg-sky-500 text-white rounded text-sm">
                    Chi tiết
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Chi tiết */}
      {showDetail && selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Chi tiết: {selected.name}</h4>
              <button onClick={()=>setShowDetail(false)} className="text-gray-600 hover:text-black">✕</button>
            </div>
            <p><strong>Ngày tạo:</strong> {selected.dateCreate}</p>
            <p><strong>Tổng tiền:</strong> {Number(selected.totalAmount || 0).toLocaleString()} đ</p>
            <p><strong>Trạng thái:</strong> {selected.statusPayment}</p>

            <h5 className="font-semibold mt-3 mb-1">Danh sách chi phí:</h5>
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Loại</th>
                    <th className="p-2 border">Mô tả</th>
                    <th className="p-2 border">Số tiền</th>
                    {role === 'ADMIN' && <th className="p-2 border">Thao tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {selected.listCost?.map((c,i)=>(
                    <tr key={c.id || i}>
                      <td className="p-2 border">{c.type}</td>
                      <td className="p-2 border">{c.description}</td>
                      <td className="p-2 border">{Number(c.amount || 0).toLocaleString()} đ</td>
                      {role === 'ADMIN' && (
                        <td className="p-2 border">
                          <button onClick={()=>handleEditCost(c)} className="px-2 py-1 bg-yellow-500 text-white rounded mr-2 text-xs">
                            Sửa
                          </button>
                          <button onClick={()=>handleDeleteCost(c)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">
                            Xoá
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {role === 'ADMIN' && (
                    <tr>
                      <td colSpan={4} className="p-2 border text-center">
                        <button 
                          onClick={handleAddCost} 
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm mt-2">
                          ➕ Thêm chi phí
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>


            {showCostForm && (
              <div className="mt-4 border-t pt-3">
                <h5 className="font-semibold mb-2">
                  {editingCost ? "Sửa chi phí" : "Thêm chi phí"}
                </h5>
                <div className="flex flex-col gap-2">
                  <input 
                    value={form.type} 
                    onChange={e=>setForm({...form, type:e.target.value})}
                    placeholder="Loại chi phí"
                    className="border p-1 rounded"
                  />
                  <input 
                    value={form.description} 
                    onChange={e=>setForm({...form, description:e.target.value})}
                    placeholder="Mô tả"
                    className="border p-1 rounded"
                  />
                  <input 
                    type="number"
                    value={form.amount} 
                    onChange={e=>setForm({...form, amount:Number(e.target.value)})}
                    placeholder="Số tiền"
                    className="border p-1 rounded"
                  />
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={saveCost} 
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                      Lưu
                    </button>
                    <button 
                      onClick={()=>{ setShowCostForm(false); setForm({type:'', description:'', amount:''}) }} 
                      className="px-3 py-1 bg-gray-400 text-white rounded text-sm">
                      Huỷ
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
