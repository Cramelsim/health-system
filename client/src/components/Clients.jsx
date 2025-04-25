import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { getClients, searchClients } from '../components/api';
import ClientEnrollmentView from '../components/EnrollmentView';

function Clients() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getClients();
      setClients(data);
    } catch (err) {
      if (err.message.includes('401')) {
        logout();
        navigate('/login');
      } else {
        setError(err.message || 'Failed to fetch clients');
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchClients(searchTerm)
          .then(data => setClients(data))
          .catch(err => setError(err.message || 'Search failed'));
      } else {
        fetchClients();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchClients]);

  if (loading) return <div className="loading">Loading clients...</div>;
  if (error) return <div className="error-message">{error}</div>;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchClients(searchTerm)
          .then(data => {
            setClients(data);
            setError('');
          })
          .catch(err => {
            setError(err.message);
            // Fallback to showing all clients if search fails
            fetchClients(); 
          });
      } else {
        fetchClients();
      }
    }, 500);
  
    return () => clearTimeout(timer);
  }, [searchTerm, fetchClients]);
  
  return (
    <div className="clients-container">
      <div className="clients-header">
        <h2>Client Management</h2>
        {user && (
          <Link to="/clients/register" className="btn-primary">
            Register New Client
          </Link>
        )}
      </div>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search clients by name or contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="clients-list">
        {clients.length === 0 ? (
          <div className="no-results">No clients found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Contact</th>
                {user && <th>Date of Birth</th>}
                {user && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.first_name} {client.last_name}</td>
                  <td>{client.contact_number || 'N/A'}</td>
                  {user && <td>{client.date_of_birth || 'N/A'}</td>}
                  {user && (
                    <td className="actions">
                      <button 
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="btn-view"
                      >
                        View Profile
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {user && (
        <div className="enrollment-section">
          <h3>Program Enrollment</h3>
          <ClientEnrollmentView />
        </div>
      )}
    </div>
  );
}

export default Clients;