import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';


function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Health Information System</Link>
      </div>
      
      <div className="navbar-links">
        <Link to="/clients" className="nav-link">
          Clients
        </Link>
        <Link to="/programs" className="nav-link">
          Programs
        </Link>
        
        {user ? (
          <>
            {user.role === 'admin' && (
              <Link to="/register/doctor" className="nav-link">
                Doctor Registration
              </Link>
            )}
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;