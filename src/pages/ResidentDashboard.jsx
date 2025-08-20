import React, { useEffect, useState } from 'react'
import api from '../api/api'

export default function ResidentDashboard(){
  const [myApartment, setMyApartment] = useState([])
  const [myMonthly, setMyMonthly] = useState([])
  const [myReports, setMyReports] = useState([])

  useEffect(()=>{
    api.get('/api/v1/apartment/myApartment').then(r => setMyApartment(r.data.result)).catch(()=>{})
    api.get('/api/v1/monthly-cost/myMonthlyCost').then(r => setMyMonthly(r.data.result)).catch(()=>{})
    api.get('/report/myReport').then(r => setMyReports(r.data.result)).catch(()=>{})
  },[])

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Resident Dashboard</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded shadow p-4 col-span-1">
          <h3 className="font-semibold mb-2">My Apartment</h3>
          {myApartment && myApartment.length ? (
            <div>
              <div className="text-sm">{myApartment[0].roomNumber} - {myApartment[0].name}</div>
              <div className="text-sm text-gray-600">{myApartment[0].description}</div>
              <div className="mt-2">
                <a className="text-sky-600 text-sm" href="/apartments">View apartments</a>
              </div>
            </div>
          ) : <div className="text-gray-500">No apartment</div>}
        </div>

        <div className="bg-white rounded shadow p-4 col-span-1">
          <h3 className="font-semibold mb-2">My Monthly Costs</h3>
          <ul className="text-sm space-y-1">
            {myMonthly && myMonthly.length ? myMonthly.map(m=> (
              <li key={m.id} className="flex justify-between">
                <span>{m.month}</span>
                <span className="text-gray-500">{m.total}</span>
              </li>
            )) : <li className="text-gray-500">No data</li>}
          </ul>
          <div className="mt-2">
            <a href="/monthly-costs" className="text-sky-600 text-sm">View details</a>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4 col-span-1">
          <h3 className="font-semibold mb-2">My Reports</h3>
          <ul className="text-sm space-y-1">
            {myReports && myReports.length ? myReports.map(r=> (
              <li key={r.id}>
                <div className="font-medium">{r.title}</div>
                <div className="text-gray-600 text-sm">{r.description}</div>
              </li>
            )) : <li className="text-gray-500">No reports</li>}
          </ul>
          <div className="mt-2">
            <a href="/reports" className="text-sky-600 text-sm">View all reports</a>
          </div>
        </div>

      </div>
    </section>
  )
}
