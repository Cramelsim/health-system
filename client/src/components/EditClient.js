import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateClient, getClientDetails } from './api';

function EditClient() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    contact_number: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await getClientDetails(clientId);
        setClient(data);
      } catch (err) {
        setError('Failed to load client data');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateClient(clientId, client);
      navigate(`/clients/${clientId}`);
    } catch (err) {
      setError('Failed to update client');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="edit-client-container">
      <h2>Edit Client Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            value={client.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            value={client.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={client.date_of_birth || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select
            name="gender"
            value={client.gender || ''}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Contact Number</label>
          <input
            type="tel"
            name="contact_number"
            value={client.contact_number || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={client.address || ''}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-save">Save Changes</button>
        <button 
          type="button" 
          className="btn-cancel"
          onClick={() => navigate(`/clients/${clientId}`)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditClient;
