const API_URL = 'http://localhost:5000';

export const setAccessToken = (token) => {
    localStorage.setItem('accessToken', token);
};

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };
  
  try {
    const response = await fetch(`${API_URL}${url}`, mergedOptions);
    
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      throw new Error('Unauthorized access');
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
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

export const getClientDetails = async (clientId) => {
    try {
        const id = Number(clientId);
        if (isNaN(id)) {
            throw new Error('Invalid client ID');
        }
        
        const response = await fetchWithAuth(`/clients/${id}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch client');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching client:', {
            message: error.message,
            clientId,
            stack: error.stack
        });
        throw error;
    }
};

export const searchClients = async (searchTerm) => {
  if (!searchTerm.trim()) {
    return { results: [] };
  }
  
  try {
    const response = await fetchWithAuth(`/clients/search?q=${encodeURIComponent(searchTerm)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Search failed:', errorData);
      return { results: [] };  
    }
    
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    return { results: [] };  
  }
};

export const createClient = async (clientData) => {
    return fetchWithAuth('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData)
    });
};

export const enrollClient = async (enrollmentData) => {
  try {
    const response = await fetchWithAuth('/enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: Number(enrollmentData.client_id),
        program_id: Number(enrollmentData.program_id),
        status: enrollmentData.status || 'Active',
        notes: enrollmentData.notes || ''
      })
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
// Program Operations
export const getHealthPrograms = async () => {
  try {
    const response = await fetchWithAuth('/programs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch programs');
    }

    return data.programs; 
  } catch (error) {
    console.error('Error fetching health programs:', error);
    throw error;
  }
};

export const getPrograms = async () => {
    return fetchWithAuth('/programs');
};

export const createProgram = async (programData) => {
  try {
    const response = await fetchWithAuth('/programs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(programData)
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to create program');
    }

    return result;
  } catch (error) {
    console.error('Create program error:', error);
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