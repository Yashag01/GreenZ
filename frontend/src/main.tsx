import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Login from './components/Login.tsx'
import LandingPage from './components/LandingPage.tsx'
import TechnicianView from './components/TechnicianView.tsx'
import DocumentationPage from './components/DocumentationPage.tsx'
import ProfilePage from './components/ProfilePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<App />} />
        <Route path="/technician" element={<TechnicianView />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
