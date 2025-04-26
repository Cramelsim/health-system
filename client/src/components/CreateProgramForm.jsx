import React, { useState } from 'react';
import { createProgram } from '../components/api';

function CreateProgramForm({ onProgramCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const result = await createProgram({
        name: name.trim(),
        description: description.trim()
      });
      
      // Clear form on success
      setName('');
      setDescription('');
      
      // Show success message
      setSuccess(result.message);
      
      // Notify parent component
      if (onProgramCreated && result.program) {
        onProgramCreated(result.program);
      }
    } catch (err) {
      setError(err.message || 'Failed to create program. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-program-form">
      <h3>Create New Program</h3>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Program Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Program'}
        </button>
      </form>
    </div>
  );
}

export default CreateProgramForm;