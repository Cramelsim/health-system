import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import Login from './components/Login';
import Clients from './components/Clients';
import ClientProgram from './components/CLientProgram';
import RegisterClient from './components/RegisterClient';
import HealthPrograms from './components/HealthPrograms';
import ProtectedRoute from './components/ProtectedRoutes';
import Navbar from './components/Navbar';
import Home from './components/Home';
import DoctorRegister from './components/DoctorRegister';
import EditClient from './EditClient'; 
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/register" element={<RegisterClient />} />
              <Route path="/clients/:clientId" element={<ClientProgram />} />
              <Route path="/programs" element={<HealthPrograms />} />
              <Route path="/register/doctor" element={<DoctorRegister />} />
              <Route path="/clients/:clientId/edit" element={<EditClient />} />
                 {/* Public routes */}
          <Route path="/clients" element={<Clients showPublicView={true} />} />
          <Route path="/programs" element={<HealthPrograms showPublicView={true} />} />
          
          {/* Protected routes */}
          <Route path="/clients/manage" element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          } />
          <Route path="/clients/:id" element={
            <ProtectedRoute>
              <ClientProgram />
            </ProtectedRoute>
          } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;