import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext'; 

function Home() {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to Health Information System</h1>
        <p>Manage clients and health programs efficiently</p>
        
        {!user ? (
          <div className="auth-buttons">
            <Link to="/login" className="btn-primary">
              Login
            </Link>
            <Link to="/register/doctor" className="btn-secondary">
              Register as Doctor
            </Link>
          </div>
        ) : (
          <div className="dashboard-links">
            <Link to="/clients" className="btn-primary">
              View Clients
            </Link>
            <Link to="/programs" className="btn-secondary">
              View Programs
            </Link>
          </div>
        )}
      </div>

      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Client Management</h3>
            <p>Register and manage client information securely.</p>
          </div>
          <div className="feature-card">
            <h3>Program Enrollment</h3>
            <p>Easily enroll clients in health programs.</p>
          </div>
          <div className="feature-card">
            <h3>Secure Access</h3>
            <p>Role-based authentication for data protection.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;