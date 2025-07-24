import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import ProjectUploadPage from './pages/ProjectUploadPage'
import CRMPage from './pages/CRMPage'
import IntroducerPortal from './pages/IntroducerPortal'
import InvestorPortal from './pages/InvestorPortal'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/upload-project" element={<ProjectUploadPage />} />
          <Route path="/crm" element={<CRMPage />} />
          <Route path="/introducer" element={<IntroducerPortal />} />
          <Route path="/investor" element={<InvestorPortal />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App