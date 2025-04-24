import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import Login from './components/Login';
import Clients from './components/Clients';
import ClientProfile from './components/ClientProfile';
import RegisterClient from './components/RegisterClient';
import HealthPrograms from './components/HealthPrograms';
import Navbar from './components/Navbar';
import Home from './components/Home';
import DoctorRegister from './components/DoctorRegister';
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
              <Route path="/clients/:clientId" element={<ClientProfile />} />
              <Route path="/programs" element={<HealthPrograms />} />
              <Route path="/register/doctor" element={<DoctorRegister />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;