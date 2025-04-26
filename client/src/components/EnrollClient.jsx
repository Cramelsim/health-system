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
    
    try {
      if (!formData.client_id || !formData.program_id) {
        throw new Error('Please select both client and program');
      }
  
      const result = await enrollClient({
        client_id: formData.client_id,
        program_id: formData.program_id,
        status: formData.status,
        notes: formData.notes,
        subject: formData.subject || 'General Enrollment' 
      });
      
      onEnrollmentSuccess(result);
      setFormData({
        client_id: '',
        program_id: '',
        status: 'Active',
        notes: '' ,
        subject: 'General Enrollment' 
      });
    } catch (err) {
      setError(err.message.includes('422') 
        ? 'Invalid data. Please check your selections.'
        : err.message.includes('409')
        ? 'This client is already enrolled in the selected program'
        : err.message);
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
    <label>Subject:</label>
    <input
      name="subject"
      value={formData.subject}
      onChange={handleChange}
      disabled={isSubmitting}
    />
  </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={isSubmitting ? 'submitting' : ''}
        >
          {isSubmitting ? 'Enrolling...' : 'Enroll Client'}
        </button>
      </form>
    </div>
  );
}

export default EnrollClient;