import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function NavBar(){
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') || null

  function logout(){
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-4 px-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          <button onClick={() => {
            if(!token) return navigate('/login')
            if(role === 'ADMIN') return navigate('/admin')
            if(role === 'RESIDENT') return navigate('/resident')
            navigate('/login')
          }} className="text-left">
            Quản lý chung cư
          </button>
        </h1>
        <nav className="flex items-center gap-4">
          {token && role === 'ADMIN' && (
            <>
              <Link to="/admin" className="text-sm text-sky-600">Trang chủ</Link>
              <Link to="/admin/apartments" className="text-sm">Quản lý căn hộ</Link>
              <Link to="/admin/monthly-costs" className="text-sm">Quản lý chi phí tháng</Link>
              <Link to="/admin/reports" className="text-sm">Yêu cầu từ cư dân</Link>
              <Link to="/admin/apartment-history" className="text-sm">Lịch sử căn hộ</Link>
              <Link to="/admin/statistics" className="text-sm">Thống kê</Link>
              <Link to="/admin/users" className="text-sm">Quản lý người dùng</Link>
            </>
          )}

          {token && role === 'RESIDENT' && (
            <>
              <Link to="/resident/apartments" className="text-sm">Căn hộ</Link>
              <Link to="/resident/reports" className="text-sm">Yêu cầu</Link>
              <Link to="/resident/monthly-costs" className="text-sm">Chi phí tháng</Link>
            </>
          )}

          {!token ? (
            <Link to="/login" className="text-sm">Đăng nhập</Link>
          ) : (
            <>
              <Link to="/profile" className="text-sm">Tài khoản</Link>
              <button onClick={logout} className="text-sm text-red-600">Đăng xuất</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
