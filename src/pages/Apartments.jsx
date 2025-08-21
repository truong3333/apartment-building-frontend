import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { Link } from 'react-router-dom'

export default function Apartments() {
  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ roomNumber: '', area: '', address: '' })
  const role = localStorage.getItem('role')

  useEffect(() => {
    load()
  }, [])

  function load() {
    api.get('/api/v1/apartment')
      .then(r => setList(r.data.result || []))
      .catch(() => {})
  }

  function filtered() {
    if (!q) return list
    return list.filter(
      a =>
        String(a.roomNumber).includes(q) ||
        (a.address || '').toLowerCase().includes(q.toLowerCase())
    )
  }

  async function remove(roomNumber) {
    if (!confirm('Delete apartment ' + roomNumber + '?')) return
    try {
      await api.delete(`/api/v1/apartment/${roomNumber}`)
      load()
    } catch (e) {
      console.error(e)
    }
  }

  function startEdit(a) {
    setEditing(a.roomNumber)
    setForm({ roomNumber: a.roomNumber, area: a.area || '', address: a.address || '' })
  }

  async function saveEdit(e) {
    e.preventDefault()
    try {
      await api.put(`/api/v1/apartment/${form.roomNumber}`, {
        area: form.area,
        address: form.address
      })
      setEditing(null)
      load()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="relative">
      {/* Table */}
      <div className={`bg-white rounded shadow p-6 ${editing ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Quản lý căn hộ</h3>
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Tìm kiếm"
              className="border px-2 py-1 rounded text-sm"
            />
            {role === 'ADMIN' && (
              <Link
                to="/admin/apartments/create"
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Thêm phòng
              </Link>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Phòng</th>
                <th className="p-2">Diện tích (m²)</th>
                <th className="p-2">Địa chỉ</th>
                <th className="p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered().map(a => (
                <tr key={a.roomNumber} className="border-t">
                  <td className="p-2">{a.roomNumber}</td>
                  <td className="p-2">{a.area}</td>
                  <td className="p-2">{a.address}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      {role === 'ADMIN' && (
                        <>
                          <button
                            onClick={() => startEdit(a)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => remove(a.roomNumber)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                          >
                            Xoá
                          </button>
                        </>
                      )}
                      <Link
                        to={`/apartments/${a.roomNumber}`}
                        className="px-3 py-1 bg-sky-500 text-white rounded text-sm"
                      >
                        Xem chi tiểt
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {editing !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setEditing(null)}
          ></div>

          {/* Modal content */}
          <div className="relative bg-white p-6 rounded shadow w-96 z-10">
            <h4 className="font-semibold mb-4">Cập nhật căn hộ {form.roomNumber}</h4>
            <form onSubmit={saveEdit} className="flex flex-col gap-3">
              <label>
                Diện tích (m²):
                <input
                  type="number"
                  value={form.area}
                  onChange={e => setForm({ ...form, area: e.target.value })}
                  className="border px-2 py-1 rounded w-full"
                />
              </label>
              <label>
                Địa chỉ:
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="border px-2 py-1 rounded w-full"
                />
              </label>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
