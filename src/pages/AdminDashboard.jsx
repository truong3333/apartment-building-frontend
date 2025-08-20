import React, { useEffect, useState } from 'react'
import api from '../api/api'
import Sidebar from '../components/Sidebar'

function VietNamDate({ className }){
  const [now, setNow] = useState(() => new Date())
  useEffect(()=>{
    const t = setInterval(()=>{
      // create date in VN timezone
      const local = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
      setNow(local)
    }, 1000)
    return ()=> clearInterval(t)
  },[])

  const weekdayMap = {
    0: 'Chủ nhật',
    1: 'Thứ hai',
    2: 'Thứ ba',
    3: 'Thứ tư',
    4: 'Thứ năm',
    5: 'Thứ sáu',
    6: 'Thứ bảy'
  }
  const wd = weekdayMap[now.getDay()]
  const day = now.getDate()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  return (
    <div className={className}>
      {`${wd}, ngày ${day} tháng ${month} năm ${year}`}
    </div>
  )
}

function Donut({ percent = 0, size = 100, stroke = 10 }){
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent/100) * circumference
  return (
    <svg width={size} height={size} className="mx-auto">
      <defs>
        <linearGradient id="g1" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <g transform={`translate(${size/2},${size/2})`}>
        <circle r={radius} fill="none" stroke="#eef2ff" strokeWidth={stroke} />
        <circle r={radius} fill="none" stroke="url(#g1)" strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} transform="rotate(-90)" />
        <text x="0" y="4" textAnchor="middle" className="text-sm font-semibold" style={{fontSize: '14px'}}>{Math.round(percent)}%</text>
      </g>
    </svg>
  )
}

export default function AdminDashboard(){
  const [dash, setDash] = useState(null)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    api.post('/api/v1/dashboard').then(r=>{
      if(!mounted) return
      setDash(r.data.result)
    }).catch(e=>{
      console.error(e)
      setError('Không thể tải dữ liệu dashboard')
    })
    return ()=> mounted = false
  },[])

  return (
      <main className="flex-1 p-6 pl-72">
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <VietNamDate className="text-sm text-gray-600" />
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded shadow p-4">
              <div className="text-sm text-gray-500">Tổng số căn hộ</div>
              <div className="text-2xl font-bold">{dash ? dash.totalApartment : '—'}</div>
            </div>
            <div className="bg-white rounded shadow p-4">
              <div className="text-sm text-gray-500">Căn hộ đang sử dụng</div>
              <div className="text-2xl font-bold">{dash ? dash.apartmentUsage : '—'}</div>
            </div>
            <div className="bg-white rounded shadow p-4">
              <div className="text-sm text-gray-500">Số lượng cư dân sinh sống</div>
              <div className="text-2xl font-bold">{dash ? dash.residentAction : '—'}</div>
            </div>
            <div className="bg-white rounded shadow p-4">
              <div className="text-sm text-gray-500">Yêu cầu chờ xử lý</div>
              <div className="text-2xl font-bold">{dash ? dash.reportWait : '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded shadow p-4 flex items-center gap-4">
              <div className="w-40 text-center">
                <Donut percent={dash ? dash.apartmentUsageRate : 0} size={120} stroke={12} />
                <div className="text-sm text-gray-600 mt-2">Tỷ lệ sử dụng</div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Chi tiết sử dụng căn hộ</h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Đang sử dụng</div>
                    <div className="h-3 bg-slate-100 rounded mt-1">
                      <div style={{width: `${dash ? (dash.apartmentUsageRate || 0) : 0}%`}} className="h-3 bg-teal-400 rounded"></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Yêu cầu chờ xử lý</div>
                    <div className="h-3 bg-slate-100 rounded mt-1">
                      <div style={{width: `${dash ? (dash.reportWait ? Math.min(100, dash.reportWait) : 0) : 0}%`}} className="h-3 bg-orange-400 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded shadow p-4">
              <h3 className="font-semibold">Hoạt động gần đây</h3>
              <div className="mt-3 text-sm text-gray-600">Số lượng cư dân sinh sống: {dash ? dash.residentAction : '—'}</div>
              <div className="mt-4">
                <a href="/admin/apartments" className="text-sky-600">Quản lý căn hộ</a>
                <div className="mt-2"><a href="/admin/reports" className="text-sky-600">Quản lý báo cáo</a></div>
              </div>
            </div>
          </div>

        </section>
      </main>
  )
}
