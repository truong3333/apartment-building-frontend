import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import ResidentDashboard from './pages/ResidentDashboard'
import MyApartmentHistory from './pages/MyApartmentHistory'
import Apartments from './pages/Apartments'
import Users from './pages/Users'
import MonthlyCosts from './pages/MonthlyCosts'
import Reports from './pages/Reports'
import CreateApartment from './pages/CreateApartment'
import CreateMonthlyCost from './pages/CreateMonthlyCost'
import CreateReport from './pages/CreateReport'
import Register from './pages/Register'
import ApartmentDetail from './pages/ApartmentDetail'
import AdminApartmentHistory from './pages/AdminApartmentHistory'
import AdminStatistics from './pages/AdminStatistics'
import MyProfile from './pages/MyProfile'
import ResidentApartments from './pages/ResidentApartments'
import MyReports from './pages/MyReports'
import MyMonthlyCosts from './pages/MyMonthlyCosts'

function RequireAuth({ children }){
  const token = localStorage.getItem('token')
  if(!token) return <Navigate to="/login" replace />
  return children
}

export default function App(){
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <main className="p-6 max-w-7xl mx-auto">
          <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/admin" element={<RequireAuth><AdminDashboard/></RequireAuth>} />
            <Route path="/admin/apartments" element={<RequireAuth><Apartments/></RequireAuth>} />
            <Route path="/admin/apartments/create" element={<RequireAuth><CreateApartment/></RequireAuth>} />
            <Route path="/admin/users" element={<RequireAuth><Users/></RequireAuth>} />
            <Route path="/admin/monthly-costs" element={<RequireAuth><MonthlyCosts/></RequireAuth>} />
            <Route path="/admin/monthly-costs/create" element={<RequireAuth><CreateMonthlyCost/></RequireAuth>} />
            <Route path="/admin/reports" element={<RequireAuth><Reports/></RequireAuth>} />
            <Route path="/admin/reports/create" element={<RequireAuth><CreateReport/></RequireAuth>} />
            <Route path="/admin/apartment-history" element={<RequireAuth><AdminApartmentHistory/></RequireAuth>} />
            <Route path="/admin/statistics" element={<RequireAuth><AdminStatistics/></RequireAuth>} />
            <Route path="/resident" element={<RequireAuth><ResidentApartments/></RequireAuth>} />
            <Route path="/resident/apartments" element={<RequireAuth><ResidentApartments/></RequireAuth>} />
            <Route path="/resident/reports" element={<RequireAuth><MyReports/></RequireAuth>} />
            <Route path="/resident/monthly-costs" element={<RequireAuth><MyMonthlyCosts/></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><MyProfile/></RequireAuth>} />
            <Route path="/apartments/:roomNumber" element={<RequireAuth><ApartmentDetail/></RequireAuth>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
