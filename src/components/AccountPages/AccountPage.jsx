import useStore from '../../zustand/store'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AccountPage () {
  const [newUsername, setNewUsername] = useState('');
  const [message, setMessage] = useState('');
  const [showInput, setShowInput] = useState(false);
  const user = useStore((state) => state.user);
  const error = useStore((state) => state.error);
  const fetchUser = useStore((state) => state.fetchUser);
  const disableUserAccount = useStore((state) => state.disableUserAccount);
  const navigate = useNavigate();
  const logOut = useStore((state) => state.logOut);  // Assuming your store has a logOut method

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);


  const handleLogout = async () => {
    try {
      await logOut();  // Call the logOut function from your store (this sends the logout request)
      navigate('/');   // Redirect to the homepage or register/login page after logout
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };
  
  const handleDisableAccount = async () => {
    try {
      const userId = localStorage.getItem('userId');  // Retrieve userId from localStorage
  
      if (!userId) {
        throw new Error('User ID is missing. Please log in first.');
      }
  
      // Proceed with disabling the account if userId is valid
      await axios.post('/api/user/disable', { userId });
  
      navigate('/login');  // Redirect to login after account is disabled
    } catch (err) {
      console.error('Error disabling account:', err.message || err);
    }
  };
  
  
  
  

  const handleChangeUsername = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/user/change-username', {
        userId: user.id,
        newUsername,
      });
      setMessage(response.data.message);
      // Update the displayed username immediately
      user.username = newUsername; 
      setShowInput(false); // Hide input after success
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Error updating username'
      );
    }
  };

  return (
    <>
    <h2>AccountPage</h2>
    <div>
    <button onClick={handleLogout}>
        Log Out
      </button>
      <h1>Welcome, {user ? user.username : 'Guest'}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleDisableAccount}>Disable Account</button>
    </div>


<div className="p-4 border rounded-lg shadow-md max-w-md mx-auto">
<h2 className="text-2xl font-bold mb-4">Account Details</h2>
<p className="text-lg mb-2"><strong>Username:</strong> {user.username}</p>
<p className="text-lg mb-4"><strong>Status:</strong> {user.status ? 'Active' : 'Inactive'}</p>

{!showInput ? (
  <button
    onClick={() => setShowInput(true)}
    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
  >
    Change Username
  </button>
) : (
  <form onSubmit={handleChangeUsername} className="mt-4">
    <input
      type="text"
      value={newUsername}
      onChange={(e) => setNewUsername(e.target.value)}
      placeholder="Enter new username"
      className="border p-2 rounded w-full mb-2"
    />
    <div className="flex gap-2">
      <button
        type="submit"
        className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => setShowInput(false)}
        className="bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500 transition"
      >
        Cancel
      </button>
    </div>
  </form>
)}

{message && <p className="mt-2 text-sm text-red-500">{message}</p>}
</div>
</>
  );
}

export default AccountPage;