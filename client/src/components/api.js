const API_URL = 'http://localhost:5000/api';

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

const fetchWithAuth = (url, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return fetch(url, {
        ...options,
        headers
    }).then(async response => {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        return data;
    });
};

export const login = async (username, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  };

export const getPrograms = () => {
    return fetchWithAuth(`${API_URL}/programs`);
};

export const createProgram = (programData) => {
    return fetchWithAuth(`${API_URL}/programs`, {
        method: 'POST',
        body: JSON.stringify(programData)
    });
};

export const getClients = (query = '') => {
    return fetchWithAuth(`${API_URL}/clients?q=${query}`);
};

export const searchClients = async (searchTerm) => {
    return fetchWithAuth(`${API_URL}/clients?q=${searchTerm}`);
  };

export const createClient = (clientData) => {
    return fetchWithAuth(`${API_URL}/clients`, {
        method: 'POST',
        body: JSON.stringify(clientData)
    });
};

export const getClientDetails = (clientId) => {
    return fetchWithAuth(`${API_URL}/clients/${clientId}`);
};

export const enrollClient = (enrollmentData) => {
    return fetchWithAuth(`${API_URL}/enrollments`, {
        method: 'POST',
        body: JSON.stringify(enrollmentData)
    });
};