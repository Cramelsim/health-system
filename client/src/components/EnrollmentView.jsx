// ClientEnrollmentView.jsx
import React, { useState, useEffect } from 'react';
import { getClients, getHealthPrograms } from '../components/api';
import EnrollClient from './EnrollClient';

export default function ClientEnrollmentView() {
  const [clients, setClients] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsData, programsData] = await Promise.all([
          getClients(),
          getHealthPrograms()
        ]);
        setClients(clientsData);
        setPrograms(programsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const handleEnrollmentSuccess = (newEnrollment) => {
    setEnrollments([...enrollments, newEnrollment]);
    alert('Client enrolled successfully!');
  };

  if (loading) return <div>Loading enrollment data...</div>;

  return (
    <div className="enrollment-view">
      <EnrollClient 
        clients={clients} 
        programs={programs} 
        onEnrollmentSuccess={handleEnrollmentSuccess}
      />
      
      <div className="enrollments-list">
        <h3>Current Enrollments</h3>
        {enrollments.length > 0 ? (
          <ul>
            {enrollments.map(enrollment => (
              <li key={enrollment.id}>
                Client: {enrollment.client_id} - Program: {enrollment.program_id}
                <br />
                Status: {enrollment.status} | Date: {enrollment.enrollment_date}
              </li>
            ))}
          </ul>
        ) : (
          <p>No enrollments yet</p>
        )}
      </div>
    </div>
  );
}