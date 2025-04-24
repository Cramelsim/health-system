import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getClients, searchClients } from '../services/api';

function Clients() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch clients');
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const search = async () => {
      if (searchTerm.trim() === '') return;
      try {
        const data = await searchClients(searchTerm);
        setClients(data);
      } catch (err) {
        setError('Search failed');
      }
    };
    
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        search();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (loading) return <div className="loading">Loading clients...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h2>Client Management</h2>
        <Link to="/clients/register" className="btn-primary">
          Register New Client
        </Link>
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
                <th>Date of Birth</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.first_name} {client.last_name}</td>
                  <td>{client.contact_number || 'N/A'}</td>
                  <td>{client.date_of_birth || 'N/A'}</td>
                  <td className="actions">
                    <button 
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className="btn-view"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Clients;