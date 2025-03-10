import useStore from '../../zustand/store';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AccountPage.css';

function AccountPage() {
  const [newUsername, setNewUsername] = useState('');
  const [message, setMessage] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [colorScore, setColorScore] = useState(0);
  const [shapeScore, setShapeScore] = useState(0);
  const [deleteMessage, setDeleteMessage] = useState('');  // For delete score success/error

  const user = useStore((state) => state.user);
  const fetchUser = useStore((state) => state.fetchUser);
  const disableUserAccount = useStore((state) => state.disableUserAccount);
  const logOut = useStore((state) => state.logOut);
  const navigate = useNavigate();

  console.log("User from Zustand:", user);
  console.log("User Object:", user);
  console.log("User ID:", user?.id);

  const fetchUserScores = async (userId) => {
    try {
      const response = await axios.get(`/api/leaderboard/user-scores/${userId}`);
      if (response.data.success) {
        setColorScore(response.data.data.color_score);
        setShapeScore(response.data.data.shape_score);
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  function deleteScore(userId, gameType) {
    console.log("Delete score:", userId, gameType);
    axios.delete(`/api/leaderboard/delete-score?user_id=${userId}&gameType=${gameType}`)
        .then((response) => {
            console.log("Back from delete:", response.data);
            fetchUserScores(userId); // Refresh scores after deletion
        })
        .catch((err) => {
            console.error(err);
            alert("Error deleting score");
        });
}

  useEffect(() => {
    fetchUser(); // Fetch user details
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserScores(user.id);
    }
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  const handleDisableAccount = async () => {
    try {
      await disableUserAccount(user.id);
      navigate('/');
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
      setShowInput(false);
      fetchUser(); // Refresh user data
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating username');
    }
  };

  return (
    <div className="account-container">
    <h2 className="account-header">Account Page</h2>
      <p className="username-info">
        Welcome {user ? user.username : 'Guest'}
      </p>

      <div className="score-container">
  <div className="score-actions">
    {colorScore > 0 && (
      <button onClick={() => user?.id && deleteScore(user.id, "color")} className="delete-score-btn">
        Delete Color Score
      </button>
    )}
    {shapeScore > 0 && (
      <button onClick={() => user?.id && deleteScore(user.id, "shape")} className="delete-score-btn">
        Delete Shape Score
      </button>
    )}
  </div>
  <div className="score-item">
    <p><strong>Color Score:</strong> {colorScore}</p>
  </div>
  <div className="score-item">
    <p><strong>Shape Score:</strong> {shapeScore}</p>
  </div>
  {deleteMessage && <p className="delete-message">{deleteMessage}</p>}
</div>

<div className="username-container"></div>
      <div className="change-username-container">
        {!showInput ? (
          <button onClick={() => setShowInput(true)} className="change-username-btn">
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
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={() => setShowInput(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        )}

        <div className="account-actions">
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
          <button className="disable-btn" onClick={handleDisableAccount}>Disable Account</button>
        </div>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default AccountPage;




