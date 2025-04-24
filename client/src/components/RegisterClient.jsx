import React, { useState } from 'react';
import { createClient } from '../components/api';
import { useNavigate } from 'react-router-dom';

function RegisterClient() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    contact_number: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createClient(formData);
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate('/clients');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to register client');
      setSuccess(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Register New Client</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Client registered successfully!</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Date of Birth:</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Contact Number:</label>
          <input
            type="tel"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Address:</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Register Client
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate('/clients')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterClient;