import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminDashboard from './pages/AdminDashboard'
import IntroducerPortal from './pages/IntroducerPortal'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/introducer" element={<IntroducerPortal />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App