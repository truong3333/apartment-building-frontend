import React from 'react'
import { Link } from 'react-router-dom'

export default function Sidebar(){
  return (
    <aside className="w-64 fixed left-0 top-0 h-full bg-white border-r p-6">
      <h4 className="font-bold mb-4">Admin</h4>
      <nav className="flex flex-col gap-2 text-sm">
        <Link to="/admin" className="text-sky-600">Dashboard</Link>
        <Link to="/admin/apartments">Apartments</Link>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/monthly-costs">Monthly Costs</Link>
        <Link to="/admin/reports">Reports</Link>
      </nav>
    </aside>
  )
}
