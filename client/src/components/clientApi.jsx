export const fetchClientDetails = async (clientId) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        credentials: 'include'
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch client data');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching client details:', error);
      throw error;
    }
  };