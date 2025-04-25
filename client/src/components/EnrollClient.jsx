import React, { useState } from 'react';
import { enrollClient } from '../components/api'; 

function EnrollClient({ clients, programs, onEnrollmentSuccess }) {
  const [formData, setFormData] = useState({
    client_id: '',
    program_id: '',
    status: 'Active',
    notes: ''
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    console.log('Enrollment data being sent:', {
      client_id: parseInt(formData.client_id),
      program_id: parseInt(formData.program_id),
      status: formData.status,
      notes: formData.notes
    });
    
    try {
      // Validate required fields
      if (!formData.client_id || !formData.program_id) {
        throw new Error('Client and Program are required');
      }

      // CORRECTED: Call the API function, not the component
      const result = await enrollClient({
        client_id: parseInt(formData.client_id),
        program_id: parseInt(formData.program_id),
        status: formData.status,
        notes: formData.notes
      });
      
      onEnrollmentSuccess(result.enrollment);
      setFormData({
        client_id: '',
        program_id: '',
        status: 'Active',
        notes: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="enrollment-form">
      <h3>Enroll Client in Program</h3>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Client:</label>
          <select 
            name="client_id" 
            value={formData.client_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.first_name} {client.last_name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Program:</label>
          <select 
            name="program_id" 
            value={formData.program_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Program</option>
            {programs.map(program => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Status:</label>
          <select 
            name="status" 
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Notes:</label>
          <textarea 
            name="notes" 
            value={formData.notes}
            onChange={handleChange}
            rows="3"
          />
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enrolling...' : 'Enroll Client'}
        </button>
      </form>
    </div>
  );
}

export default EnrollClient;