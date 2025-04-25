import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { getPrograms, createProgram } from '../components/api';

function HealthPrograms() {
  const [programs, setPrograms] = useState([]);
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await getPrograms();
        setPrograms(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch programs');
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const handleInputChange = (e) => {
    setNewProgram({
      ...newProgram,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProgram(newProgram);
      setSuccess('Program created successfully');
      setError('');
      setNewProgram({ name: '', description: '' });
      
      const data = await getPrograms();
      setPrograms(data);
    } catch (err) {
      setError(err.message || 'Failed to create program');
      setSuccess('');
    }
  };

  if (loading) return <div className="loading">Loading programs...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="programs-container">
      <div className="programs-header">
        <h2>Health Programs</h2>
      </div>
      
      <div className="programs-content">
        <div className="programs-list">
          <h3>Available Programs</h3>
          {!user && (
            <div className="login-prompt">
              <p>Login to view program details and enrollment information.</p>
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            </div>
          )}
          {programs.length === 0 ? (
            <p>No programs available</p>
          ) : (
            <ul>
              {programs.map(program => (
                <li key={program.id}>
                  <div className="program-item">
                    <h4>{program.name}</h4>
                    {user && <p>{program.description}</p>}
                    {user && (
                      <Link to={`/clients?program=${program.id}`} className="btn-view">
                        View Enrolled Clients
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {user && (
          <div className="create-program">
            <h3>Create New Program</h3>
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Program Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newProgram.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={newProgram.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <button type="submit" className="btn-primary">
                Create Program
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default HealthPrograms;