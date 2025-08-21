import React, { useEffect, useState } from 'react'
import api from '../api/api'

export default function MyProfile(){
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [user, setUser] = useState(null)

  // profile form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cmnd, setCmnd] = useState('')
  const [address, setAddress] = useState('')
  const [gender, setGender] = useState('')
  const [dob, setDob] = useState('')

  // password form
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')

  useEffect(()=>{ load() }, [])

  function load(){
    setLoading(true)
    setError('')
    api.get('/api/v1/users/myInfo')
      .then(r=>{
        const d = r.data.result
        setUser(d)
        setFullName(d.fullName || '')
        setEmail(d.email || '')
        setPhone(d.phone || '')
        setCmnd(d.cmnd || '')
        setAddress(d.address || '')
        setGender(d.gender || '')
        setDob(d.dob || '')
      })
      .catch(e=>{
        console.error(e)
        setError('Không thể tải thông tin người dùng')
      })
      .finally(()=>setLoading(false))
  }

  function validateProfile(){
    setFormError('')
    if(!fullName.trim()) return setFormError('Họ tên là bắt buộc')
    if(email && !/^\S+@\S+\.\S+$/.test(email)) return setFormError('Email không hợp lệ')
    if(phone && !/^\d{6,15}$/.test(phone)) return setFormError('Số điện thoại không hợp lệ')
    return true
  }

  async function saveProfile(){
    if(!validateProfile()) return
    if(!user || !user.username) return setFormError('Dữ liệu người dùng chưa sẵn sàng')
    setSaving(true)
    setSuccess('')
    try{
      const payload = {
        fullName,
        email,
        phone,
        cmnd,
        address,
        gender,
        dob
      }
      await api.put(`/api/v1/users/${user.username}`, payload)
      setSuccess('Cập nhật thông tin thành công')
      load()
    }catch(e){
      console.error(e)
      setFormError(e?.response?.data?.message || 'Lỗi khi cập nhật thông tin')
    }finally{
      setSaving(false)
    }
  }

  function validatePassword(){
    setPwdError('')
    if(!oldPassword) return setPwdError('Mật khẩu cũ là bắt buộc')
    if(!password || password.length < 8) return setPwdError('Mật khẩu mới cần >= 8 ký tự')
    return true
  }

  async function changePassword(){
    if(!validatePassword()) return
    if(!user || !user.username) return setPwdError('Dữ liệu người dùng chưa sẵn sàng')
    setPwdSaving(true)
    setPwdSuccess('')
    try{
      const payload = { oldPassword, password }
      await api.put(`/api/v1/users/${user.username}`, payload)
      setPwdSuccess('Đổi mật khẩu thành công')
      setOldPassword('')
      setPassword('')
    }catch(e){
      console.error(e)
      setPwdError(e?.response?.data?.message || 'Lỗi khi đổi mật khẩu')
    }finally{
      setPwdSaving(false)
    }
  }

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Tài khoản của tôi</h3>
      </div>

      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 rounded">
            <h4 className="font-semibold mb-3">Sửa thông tin cá nhân</h4>
            {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
            {success && <div className="text-green-600 text-sm mb-2">{success}</div>}

            <div className="space-y-2">
              <div>
                <label className="text-sm block mb-1">Họ và tên</label>
                <input value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label className="text-sm block mb-1">Email</label>
                <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label className="text-sm block mb-1">Số điện thoại</label>
                <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label className="text-sm block mb-1">Số CMND</label>
                <input value={cmnd} onChange={e=>setCmnd(e.target.value)} className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label className="text-sm block mb-1">Địa chỉ</label>
                <input value={address} onChange={e=>setAddress(e.target.value)} className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label className="text-sm block mb-1">Giới tính</label>
                <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full border px-2 py-1 rounded">
                  <option value="">Chọn</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div>
                <label className="text-sm block mb-1">Ngày sinh</label>
                <input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="w-full border px-2 py-1 rounded" />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button onClick={load} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
                <button onClick={saveProfile} disabled={saving} className="px-4 py-2 bg-sky-600 text-white rounded">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded">
            <h4 className="font-semibold mb-3">Đổi mật khẩu</h4>
            {pwdError && <div className="text-red-600 text-sm mb-2">{pwdError}</div>}
            {pwdSuccess && <div className="text-green-600 text-sm mb-2">{pwdSuccess}</div>}

            <div className="space-y-2">
              <div>
                <label className="text-sm block mb-1">Mật khẩu cũ</label>
                <input type="password" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label className="text-sm block mb-1">Mật khẩu mới</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border px-2 py-1 rounded" />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button onClick={()=>{setOldPassword(''); setPassword(''); setPwdError(''); setPwdSuccess('')}} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
                <button onClick={changePassword} disabled={pwdSaving} className="px-4 py-2 bg-sky-600 text-white rounded">{pwdSaving ? 'Đang lưu...' : 'Đổi mật khẩu'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
