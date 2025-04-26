import React, { useState, useEffect } from 'react';
import { getHealthPrograms } from '../components/api';
import CreateProgramForm from './CreateProgramForm';

function HealthPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await getHealthPrograms();
      if (Array.isArray(data)) {
        setPrograms(data);
      } else {
        setPrograms([]);
        console.error('Expected array but got:', data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleProgramCreated = (newProgram) => {
    setPrograms(prev => [...prev, newProgram]);
  };

  if (loading) return <div>Loading programs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="programs-container">
      <h2>Health Programs</h2>
      
      
      <CreateProgramForm onProgramCreated={handleProgramCreated} />
      
      <div className="programs-list">
        {programs.length > 0 ? (
          programs.map(program => (
            <div key={program.id} className="program-item">
              <h3>{program.name}</h3>
              <p>{program.description}</p>
            </div>
          ))
        ) : (
          <p>No programs available</p>
        )}
      </div>
    </div>
  );
}

export default HealthPrograms;