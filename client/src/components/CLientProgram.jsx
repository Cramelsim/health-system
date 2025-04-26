import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getClientDetails } from './api';

function ClientProfile() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const data = await getClientDetails(clientId);
        
        if (!data) {
          throw new Error('Client data is empty');
        }
        
        setClient(data);
      } catch (err) {
        console.error('Fetch error details:', {
          message: err.message,
          status: err.response?.status,
          clientId
        });
        
        setError(err.message.includes('404') 
          ? 'Client not found' 
          : 'Failed to load client data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchClientData();
  }, [clientId]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner"></div>
        <p>Loading client data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate(-1)} className="btn-back">
          Go Back
        </button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="profile-container">
        <p>Client not found</p>
        <button onClick={() => navigate(-1)} className="btn-back">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Client Profile</h2>
        <button onClick={() => navigate(-1)} className="btn-back">
          Back to Clients
        </button>
      </div>

      <div className="profile-card">
        <div className="profile-section">
          <div className="profile-image">
            <div className="avatar">
              {(client.first_name?.charAt(0) || '')}{(client.last_name?.charAt(0) || '')}
            </div>
          </div>

          <div className="profile-info">
            <h3>{client.first_name} {client.last_name}</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Age:</span>
                <span className="info-value">{calculateAge(client.date_of_birth)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Gender:</span>
                <span className="info-value">{client.gender || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Contact:</span>
                <span className="info-value">{client.contact_number || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{client.address || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="program-section">
          <h4>Enrolled Programs</h4>
          {client.enrollments && client.enrollments.length > 0 ? (
            client.enrollments.map(enrollment => (
              <div key={enrollment.program_id} className="program-card">
                <div className="program-header">
                  <h5>{enrollment.program_name}</h5>
                  <span className={`status-badge ${enrollment.status.toLowerCase()}`}>
                    {enrollment.status}
                  </span>
                </div>
                <div className="program-details">
                  <div className="detail-item">
                    <span>Enrollment Date:</span>
                    <span>{new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span>Notes:</span>
                    <span>{enrollment.notes || 'No notes'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-program">This client is not currently enrolled in any program.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientProfile;