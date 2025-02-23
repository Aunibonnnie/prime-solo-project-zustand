import axios from 'axios';

// Ensure axios includes credentials (cookies for sessions)
axios.defaults.withCredentials = true;

const userSlice = (set, get) => ({
  user: {}, // Stores user info
  authErrorMessage: '',
  error: null,
  scores: { color_score: 0, shape_score: 0 }, // Stores user scores

  // Fetch logged-in user
  fetchUser: async () => {
    try {
      const { data } = await axios.get('/api/user');
      set({ user: data });
    } catch (err) {
      console.log('fetchUser error:', err);
      set({ user: {} });
    }
  },

  // Fetch user scores (color & shape)
  fetchUserScores: async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/game/user-scores/${userId}`);
      if (response.data.success) {
        set({ scores: response.data.data });
      }
    } catch (error) {
      console.error('Error fetching user scores:', error);
      set({ error: 'Failed to fetch scores' });
    }
  },

  // Register new user
  register: async (newUserCredentials) => {
    get().setAuthErrorMessage('');
    try {
      await axios.post('/api/user/register', newUserCredentials);
      get().logIn(newUserCredentials); // Auto-login after registration
    } catch (err) {
      console.log('register error:', err);
      get().setAuthErrorMessage('Oops! Registration failed. That username might already be taken. Try again!');
    }
  },

  // User login
  logIn: async (userCredentials) => {
    get().setAuthErrorMessage('');
    try {
      await axios.post('/api/user/login', userCredentials);
      get().fetchUser();
    } catch (err) {
      console.log('logIn error:', err);
      if (err.response?.status === 401) {
        get().setAuthErrorMessage('Oops! Login failed. Invalid username or password. Try again!');
      } else {
        get().setAuthErrorMessage('Oops! Login failed. It might be our fault. Try again!');
      }
    }
  },

  // Guest login
  guestLogin: async () => {
    get().setAuthErrorMessage('');
    try {
      const { data } = await axios.post('/api/user/guest');
      set({ user: data }); // Store guest user info
    } catch (err) {
      console.log('guestLogin error:', err);
      get().setAuthErrorMessage('Guest login failed. Please try again.');
    }
  },

  // Disable user account
  disableUserAccount: async (userId) => {
    try {
      console.log('Disabling user with ID:', userId);
      const response = await axios.post('/api/user/disable', { userId });

      if (response.status === 200) {
        await get().logOut();
        return response.data;
      } else {
        throw new Error('Failed to disable account');
      }
    } catch (err) {
      console.error('Error in disableUserAccount:', err);
      set({ error: err.message });
      throw err;
    }
  },

  // User logout
  logOut: async () => {
    try {
      await axios.post('/api/user/logout');
      set({ user: {} });
    } catch (err) {
      console.log('logOut error:', err);
    }
  },

  // Set authentication error messages
  setAuthErrorMessage: (message) => {
    set({ authErrorMessage: message });
  }
});

export default userSlice;


// call disableaccount to logOut set({user : {}});
