const API_BASE_URL = 'http://localhost:3001/api';

export class SharingService {
  static async shareTask(task: any, sharedTo: string, sharedFrom: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/share-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task,
          sharedTo,
          sharedFrom
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sharing task:', error);
      throw error;
    }
  }

  static async getSharedTasks(userEmail: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/shared-tasks/${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching shared tasks:', error);
      throw error;
    }
  }

  static async acceptSharedTask(taskId: string, userEmail: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/accept-shared-task/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error accepting shared task:', error);
      throw error;
    }
  }

  static async declineSharedTask(taskId: string, userEmail: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/decline-shared-task/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error declining shared task:', error);
      throw error;
    }
  }

  static async searchUsers(query: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/search/${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  static async registerUser(email: string, username: string, displayName: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          displayName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  static async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Server health check failed:', error);
      return { 
        status: 'OFFLINE', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
