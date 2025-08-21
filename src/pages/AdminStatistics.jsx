import React, { useEffect, useState } from 'react'
import api from '../api/api'

function Pie({ values = [], colors = [], size = 160, inner = 60 }){
  // simple donut using stroke-dasharray for reliability
  const total = values.reduce((s,v)=>s+v,0) || 1
  const used = values[0] || 0
  const proportion = Math.max(0, Math.min(1, used / total))
  const r = (size - 8) / 2 // leave room for stroke
  const cx = size/2
  const cy = size/2
  const circumference = 2 * Math.PI * r
  const dash = proportion * circumference
  const bgColor = colors[1] || '#e5e7eb'
  const fgColor = colors[0] || '#06b6d4'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={bgColor} strokeWidth={inner/2} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={fgColor} strokeWidth={inner/2}
          strokeDasharray={`${dash} ${circumference - dash}`} strokeLinecap="round" />
      </g>
    </svg>
  )
}
  function Donut({ values = [], colors = [], size = 160, thickness = 18 }){
    // multi-segment donut using multiple stroked circles
    const total = Math.max(1, values.reduce((s, v) => s + (Number(v) || 0), 0))
    const r = (size - 4) / 2
    const cx = size / 2
    const cy = size / 2
    const circumference = 2 * Math.PI * r

    let cumulative = 0
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {/* background circle */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef2f7" strokeWidth={thickness} />
          {values.map((v, i) => {
            const val = Math.max(0, Number(v) || 0)
            const dash = (val / total) * circumference
            const offset = -cumulative
            cumulative += dash
            const color = colors[i] || (i === 0 ? '#06b6d4' : ['#10b981', '#f59e0b', '#ef4444'][i % 4])
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            )
          })}
        </g>
      </svg>
    )
  }

  function DonutPercent({ percent = 0, size = 100, stroke = 10, id = 'g-stat' }){
    const p = Math.max(0, Math.min(100, Number(percent) || 0))
    const radius = (size - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (p/100) * circumference
    return (
      <svg width={size} height={size} className="mx-auto">
        <defs>
          <linearGradient id={id} x1="0%" x2="100%">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <g transform={`translate(${size/2},${size/2})`}>
          <circle r={radius} fill="none" stroke="#eef2ff" strokeWidth={stroke} />
          <circle r={radius} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} transform="rotate(-90)" />
          <text x="0" y="4" textAnchor="middle" className="text-sm font-semibold" style={{fontSize: '14px'}}>{Math.round(p)}%</text>
        </g>
      </svg>
    )
  }

  function ProgressBar({ value = 0, className = '' }){
    const pct = Math.max(0, Math.min(100, Number(value) || 0))
    return (
      <div className={`w-full bg-slate-100 rounded overflow-hidden ${className}`} style={{ height: 12 }}>
        <div className="bg-gradient-to-r from-green-500 to-sky-500 h-full" style={{ width: `${pct}%` }} />
      </div>
    )
  }

export default function AdminStatistics(){
  const [month, setMonth] = useState(new Date().getMonth()+1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchStats(){
    setLoading(true)
    setError(null)
    try{
      const res = await api.post('/api/v1/statistics', { month: Number(month), year: Number(year) })
      setData(res.data.result)
    }catch(e){
      console.error(e)
      setError('Không thể tải thống kê')
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ fetchStats() }, [])

  const used = data ? Number(data.apartmentUsage || 0) : 0
  const total = data ? Number(data.totalApartment || 0) : 0
  const unused = Math.max(0, total - used)
  // Prefer backend-provided totals when available (avoid mixing ?? with ||)
  const reportDone = data ? Number(data.reportStatusDone ?? data.reportDone ?? 0) : 0
  let reportTotal = 0
  if (data) {
    if (typeof data.totalReport !== 'undefined' && data.totalReport !== null) {
      reportTotal = Number(data.totalReport)
    } else {
      reportTotal = Number(reportDone) + Number(data.reportWait || 0)
    }
  }
  const reportWait = Math.max(0, reportTotal - reportDone)
  let reportDoneRate = 0
  if (data) {
    if (typeof data.reportDoneRate !== 'undefined' && data.reportDoneRate !== null) {
      reportDoneRate = Number(data.reportDoneRate)
    } else {
      reportDoneRate = reportTotal ? (reportDone / reportTotal) * 100 : 0
    }
  }

  function formatDate(d){
    if(!d) return '-'
    try{
      // handle LocalDate strings like YYYY-MM-DD
      const dt = new Date(d)
      return dt.toLocaleDateString('vi-VN')
    }catch(e){
      return d
    }
  }

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Thống kê</h3>
        <div className="flex items-center gap-2">
          <input type="number" min={1} max={12} value={month} onChange={e=>setMonth(e.target.value)} className="border px-2 py-1 rounded w-20 text-sm" />
          <input type="number" value={year} onChange={e=>setYear(e.target.value)} className="border px-2 py-1 rounded w-24 text-sm" />
          <button onClick={fetchStats} className="px-3 py-1 bg-sky-600 text-white rounded">Xem</button>
        </div>
      </div>

      {loading && <div className="p-4">Loading...</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 flex flex-col items-center justify-center p-4">
            <div className="relative">
              <h4 className="font-semibold mb-2">Sử dụng căn hộ</h4>
              <DonutPercent id="g-apartment" percent={total ? (used/total)*100 : 0} size={220} stroke={26} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">            
              </div>
            </div>
            <div className="mt-3 flex gap-3 items-center">
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-sky-400 rounded"/> Đang ở</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-200 rounded"/> Trống</div>
            </div>
          </div>

          <div className="col-span-2 p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-xs text-gray-500">Số căn hộ</div>
                <div className="text-2xl font-semibold">{data.totalApartment}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-xs text-gray-500">Tỉ lệ sử dụng</div>
                <div className="text-2xl font-semibold">{data.apartmentUsageRate}%</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-xs text-gray-500">Tổng tiền</div>
                <div className="text-2xl font-semibold">{data.totalAmount}</div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded">
                <div className="text-xs text-gray-500">Người vào</div>
                <div className="text-xl font-semibold">{data.userInSize}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded">
                <div className="text-xs text-gray-500">Người ra</div>
                <div className="text-xl font-semibold">{data.userOutSize}</div>
              </div>
            </div>

            <div className="mt-3">
                <h4 className="font-semibold mb-2">Báo cáo</h4>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <DonutPercent id="g-report" percent={reportDoneRate} size={120} stroke={18} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-600 rounded" /> Đã xong: <strong className="ml-1">{reportDone}</strong></div>
                      <div className="flex items-center gap-2 mt-2"><div className="w-3 h-3 bg-yellow-400 rounded" /> Chờ xử lý: <strong className="ml-1">{reportWait}</strong></div>
                      <div className="mt-3 w-48"><ProgressBar value={reportDoneRate} /></div>
                    </div>
                  </div>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Người vào</h4>
                <ul className="text-sm space-y-2 max-h-48 overflow-auto">
                  {data.listUserIn && data.listUserIn.length ? data.listUserIn.map((h, idx)=>(
                    <li key={idx} className="flex justify-between items-center border rounded p-2">
                      <div>
                        <div className="font-medium">{h.userResponse?.username || '-'} <span className="text-gray-500">— {h.userResponse?.fullName || '-'}</span></div>
                        <div className="text-xs text-gray-400">Phòng: {h.roomNumber} {h.isRepresentative ? <span className="ml-2 inline-block px-2 text-xs bg-yellow-100 text-yellow-700 rounded">Đại diện</span> : null}</div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        <div>Vào: {formatDate(h.startDate)}</div>
                        <div>Ra: {h.endDate ? formatDate(h.endDate) : '-'}</div>
                      </div>
                    </li>
                  )) : <li className="text-gray-500">Không có</li>}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Người ra</h4>
                <ul className="text-sm space-y-2 max-h-48 overflow-auto">
                  {data.listUserOut && data.listUserOut.length ? data.listUserOut.map((h, idx)=>(
                    <li key={idx} className="flex justify-between items-center border rounded p-2">
                      <div>
                        <div className="font-medium">{h.userResponse?.username || '-'} <span className="text-gray-500">— {h.userResponse?.fullName || '-'}</span></div>
                        <div className="text-xs text-gray-400">Phòng: {h.roomNumber} {h.isRepresentative ? <span className="ml-2 inline-block px-2 text-xs bg-yellow-100 text-yellow-700 rounded">Đại diện</span> : null}</div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        <div>Vào: {formatDate(h.startDate)}</div>
                        <div>Ra: {h.endDate ? formatDate(h.endDate) : '-'}</div>
                      </div>
                    </li>
                  )) : <li className="text-gray-500">Không có</li>}
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
