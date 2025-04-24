import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

function Home() {
  const { user } = useAuth();
  const [providerCount, setProviderCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [satisfactionRate, setSatisfactionRate] = useState(0);
  const statsRef = useRef(null);

  // Animation function for counting up
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const handleIntersect = (entries) => {
      if (entries[0].isIntersecting) {
        startCountingAnimation();
        observer.disconnect(); // Only animate once
      }
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    // Store the current ref value in a variable for cleanup
    const currentRef = statsRef.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      // Use the variable in the cleanup function
      if (currentRef) {
        observer.disconnect();
      }
    };
  }, []);

  const startCountingAnimation = () => {
    // Provider count animation (0 to 500)
    const providerDuration = 2000; // 2 seconds
    const providerIncrement = 500 / (providerDuration / 16);
    let providerCurrent = 0;
    
    const providerInterval = setInterval(() => {
      providerCurrent += providerIncrement;
      if (providerCurrent >= 500) {
        setProviderCount(500);
        clearInterval(providerInterval);
      } else {
        setProviderCount(Math.floor(providerCurrent));
      }
    }, 16);

    // Patient count animation (0 to 10,000)
    const patientDuration = 2500; // 2.5 seconds
    const patientIncrement = 10000 / (patientDuration / 16);
    let patientCurrent = 0;
    
    const patientInterval = setInterval(() => {
      patientCurrent += patientIncrement;
      if (patientCurrent >= 10000) {
        setPatientCount(10000);
        clearInterval(patientInterval);
      } else {
        setPatientCount(Math.floor(patientCurrent));
      }
    }, 16);

    // Satisfaction rate animation (0 to 98)
    const rateInterval = setInterval(() => {
      setSatisfactionRate(prev => {
        if (prev >= 98) {
          clearInterval(rateInterval);
          return 98;
        }
        return prev + 1;
      });
    }, 20);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to Health Information System
          </h1>
          <p className="hero-description">
            A comprehensive platform to manage clients and health programs efficiently
          </p>
          
          {!user ? (
            <div className="auth-buttons">
              <Link to="/login" className="btn-primary">
                Login to Your Account
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
              <Link to="/programs" className="btn-green">
                View Programs
              </Link>
              <Link to="/dashboard" className="btn-purple full-width">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Feature Section */}
      <div className="features-section">
        <div className="container">
          <h2 className="section-title">
            Key Features
          </h2>
          <div className="features-grid">
            <div className="feature-card blue">
              <div className="feature-icon blue">
                <span className="icon">👥</span>
              </div>
              <h3 className="feature-title blue">Client Management</h3>
              <p className="feature-description">Register and manage client information securely with our intuitive interface.</p>
            </div>
            <div className="feature-card green">
              <div className="feature-icon green">
                <span className="icon">📋</span>
              </div>
              <h3 className="feature-title green">Program Enrollment</h3>
              <p className="feature-description">Easily enroll clients in health programs and track their progress over time.</p>
            </div>
            <div className="feature-card purple">
              <div className="feature-icon purple">
                <span className="icon">🔒</span>
              </div>
              <h3 className="feature-title purple">Secure Access</h3>
              <p className="feature-description">Role-based authentication ensures data protection and appropriate access control.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial/Stats Section */}
      <div className="stats-section" ref={statsRef}>
        <div className="container">
          <h2 className="stats-title">Trusted by Healthcare Professionals</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <p className="stat-number">{providerCount}+</p>
              <p className="stat-label">Healthcare Providers</p>
            </div>
            <div className="stat-item">
              <p className="stat-number">{patientCount.toLocaleString()}+</p>
              <p className="stat-label">Patients Managed</p>
            </div>
            <div className="stat-item">
              <p className="stat-number">{satisfactionRate}%</p>
              <p className="stat-label">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Call-to-Action */}
      <div className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to streamline your healthcare management?</h2>
          <p className="cta-description">
            Join thousands of healthcare professionals who are already using our platform
            to improve patient care and operational efficiency.
          </p>
          {!user && (
            <Link to="/register/doctor" className="btn-primary cta-button">
              Get Started Today
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;