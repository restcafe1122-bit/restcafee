import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout.jsx'
import MenuPage from './pages/Menu.jsx'
import AdminLoginPage from './pages/AdminLogin.jsx'
import AdminDashboardPage from './pages/AdminDashboard.jsx'
import { createPageUrl } from './utils'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={createPageUrl("Menu")} replace />} />
        <Route path={createPageUrl("Menu")} element={<MenuPage />} />
        <Route path={createPageUrl("AdminLogin")} element={<AdminLoginPage />} />
        <Route path={createPageUrl("AdminDashboard")} element={<AdminDashboardPage />} />
      </Routes>
    </Layout>
  )
}

export default App 