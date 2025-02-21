import useStore from '../../zustand/store'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AccountPage.css'; // Import the CSS file

function AccountPage () {
  const [newUsername, setNewUsername] = useState('');
  const [message, setMessage] = useState('');
  const [showInput, setShowInput] = useState(false);
  const error = useStore((state) => state.error);
  const fetchUser = useStore((state) => state.fetchUser);
  const disableUserAccount = useStore((state) => state.disableUserAccount);
  const user = useStore((state) => state.user);
  const navigate = useNavigate();
  const logOut = useStore((state) => state.logOut);  // Assuming your store has a logOut method

  useEffect(() => {
    fetchUser()
    console.log('user id is ', user.id);
  }, []);

  const goToLoginPage = () => {
    navigate('/');
  };

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
      console.log( 'user ID is', user.id)
  
      // Proceed with disabling the account if userId is valid
      await disableUserAccount(user.id);
  
      navigate('/');  // Redirect to login after account is disabled
      console.log(navigate);
    } catch (err) {
      console.error('Error disabling account:', err);
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
    <div className="account-container">
      <h2 className="account-header">AccountPage</h2>
      <p className="username-info">
        Welcome <strong>Username:</strong> {user ? user.username : 'Guest'}
        <strong> Status:</strong> {user.status ? 'Active' : 'Inactive'}
      </p>
    <div className="change-username-container">
    {!showInput ? (
      <button
        onClick={() => setShowInput(true)}
        className="change-username-btn"
      >
        Change Username
      </button>
    ) : (
      <form onSubmit={handleChangeUsername} className="change-username-form">
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="Enter new username"
          className="change-username-input"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="save-btn"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setShowInput(false)}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    )}
      <div className="account-actions">
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        {error && <p className="error-message">{error}</p>}
        <button className="disable-btn" onClick={goToLoginPage}>Disable Account</button>
      </div>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default AccountPage;

