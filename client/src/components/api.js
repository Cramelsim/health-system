const API_URL = 'http://localhost:5000';

export const setAccessToken = (token) => {
    localStorage.setItem('accessToken', token);
};

export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('accessToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };
  
    try {
      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
        credentials: 'include'
      });
  
      if (!response.ok) {
        // Get detailed error message from response body
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || 
                        errorData.error || 
                        `Request failed with status ${response.status}`;
        
        throw new Error(`${errorMsg} (${response.status})`);
      }
  
      return response.json();
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  };

// Authentication
export const login = async (username, password) => {
    return fetchWithAuth('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
};

export const logout = async () => {
    localStorage.removeItem('accessToken');
    try {
        await fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// Client Operations
export const getClients = async () => {
    try {
      const response = await fetch(`${API_URL}/clients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch clients');
      return await response.json();
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  };


export const searchClients = async (searchTerm) => {
    return getClients(searchTerm); // Reuse getClients with search term
};


export const getClientDetails = async (clientId) => {
    return fetchWithAuth(`/clients/${clientId}`);
};

export const createClient = async (clientData) => {
    return fetchWithAuth('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData)
    });
};

// Program Operations

export const getHealthPrograms = async () => {
    try {
      const response = await fetch(`${API_URL}/programs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch programs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching health programs:', error);
      throw error;
    }
  };
export const createProgram = async (programData) => {
    return fetchWithAuth('/programs', {
        method: 'POST',
        body: JSON.stringify(programData)
    });
};

export const getPrograms = async () => {
    return fetchWithAuth('/programs');
};

// Enrollment Operations
// api.js
// api.js
export const enrollClient = async (enrollmentData) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const response = await fetch(`${API_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Ensure this matches exactly
        },
        body: JSON.stringify(enrollmentData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Enrollment failed');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Enrollment error:', error);
      throw error;
    }
  };
// Doctor Registration
export const registerDoctor = async (doctorData) => {
    return fetchWithAuth('/api/auth/register/doctor', {
        method: 'POST',
        body: JSON.stringify(doctorData)
    });
};