import React, { useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cmnd, setCmnd] = useState('')
  const [address, setAddress] = useState('')
  const [gender, setGender] = useState('')
  const [dob, setDob] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  function validate(){
    const e = {}
    if(!username || username.length < 8) e.username = 'Tên đăng nhập ít nhất 8 ký tự'
    if(!password || password.length < 8) e.password = 'Mật khẩu ít nhất 8 ký tự'
    // simple email regex
    if(!email || !/^\S+@\S+\.\S+$/.test(email)) e.email = 'Email không hợp lệ'
    if(!phone || !/^\d{10}$/.test(phone)) e.phone = 'Số điện thoại phải 10 chữ số'
    if(!cmnd || !/^\d{12}$/.test(cmnd)) e.cmnd = 'CMND/CCCD phải 12 chữ số'
    if(!gender || (gender !== 'Nam' && gender !== 'Nữ')) e.gender = 'Chọn giới tính'
    if(!dob) e.dob = 'Ngày sinh không được để trống'
    return e
  }

  async function submit(e){
    e.preventDefault()
    setErrors({})
    const eObj = validate()
    if(Object.keys(eObj).length){ setErrors(eObj); return }
    setLoading(true)
    try{
      // backend expects LocalDate for dob in format yyyy-MM-dd
      const payload = { username, password, fullName, email, phone, cmnd, address, gender: gender === 'MALE' ? 'MALE' : 'FEMALE', dob }
      await api.post('/api/v1/users', payload)
      nav('/login')
    }catch(err){
      const msg = err?.response?.data?.message || 'Register failed'
      setErrors({ server: msg })
    }finally{ setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto mt-6 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Đăng ký</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm">Tên đăng nhập</label>
          <input className="w-full border rounded px-3 py-2" value={username} onChange={e=>setUsername(e.target.value)} />
          {errors.username && <div className="text-red-600 text-sm">{errors.username}</div>}
        </div>

        <div>
          <label className="block text-sm">Mật khẩu</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} />
          {errors.password && <div className="text-red-600 text-sm">{errors.password}</div>}
        </div>

        <div>
          <label className="block text-sm">Họ và tên</label>
          <input className="w-full border rounded px-3 py-2" value={fullName} onChange={e=>setFullName(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm">Email</label>
          <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
          {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
        </div>

        <div>
          <label className="block text-sm">Số điện thoại</label>
          <input className="w-full border rounded px-3 py-2" value={phone} onChange={e=>setPhone(e.target.value)} />
          {errors.phone && <div className="text-red-600 text-sm">{errors.phone}</div>}
        </div>

        <div>
          <label className="block text-sm">CMND/CCCD</label>
          <input className="w-full border rounded px-3 py-2" value={cmnd} onChange={e=>setCmnd(e.target.value)} />
          {errors.cmnd && <div className="text-red-600 text-sm">{errors.cmnd}</div>}
        </div>

        <div>
          <label className="block text-sm">Địa chỉ</label>
          <input className="w-full border rounded px-3 py-2" value={address} onChange={e=>setAddress(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm">Giới tính</label>
          <select className="w-full border rounded px-3 py-2" value={gender} onChange={e=>setGender(e.target.value)}>
            <option value="">-- Chọn --</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
          {errors.gender && <div className="text-red-600 text-sm">{errors.gender}</div>}
        </div>

        <div>
          <label className="block text-sm">Ngày sinh</label>
          <input type="date" className="w-full border rounded px-3 py-2" value={dob} onChange={e=>setDob(e.target.value)} />
          {errors.dob && <div className="text-red-600 text-sm">{errors.dob}</div>}
        </div>

        {errors.server && <div className="text-red-600 text-sm">{errors.server}</div>}

        <div>
          <button disabled={loading} className={`w-full px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </div>
         <div className="mt-3 text-sm">Đã có tài khoản ?
          <a href="/login" className="text-sky-600"> Đăng nhập</a>
        </div>
      </form>
    </div>
  )
}
