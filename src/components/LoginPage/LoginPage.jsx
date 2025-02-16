import { useState, useEffect } from 'react';
import useStore from '../../zustand/store';
import './LoginPage.css';


function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const logIn = useStore((state) => state.logIn);
  const guestLogin = useStore((state) => state.guestLogin);
  const errorMessage = useStore((state) => state.authErrorMessage);
  const setAuthErrorMessage = useStore((state) => state.setAuthErrorMessage);

  useEffect(() => {
    // Clear the auth error message when the component unmounts:
    return () => {
      setAuthErrorMessage('');
    }
  }, [])

  const handleLogIn = (event) => {
    event.preventDefault();

    logIn({
      username: username,
      password: password,
    })
  };

  return (
    <div className="login-container">
      <h2>Welcome to the Game!</h2>
      <div className="guest-section">
        <button
          onClick={(e) => {
            e.preventDefault();
            guestLogin();
          }}
          className="guest-button"
        >
          Play as Guest
        </button>
      </div>
      <div className="divider">
        <span>or</span>
      </div>
      <form onSubmit={handleLogIn} className="login-form">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">
          Log In
        </button>
      </form>
      { // Conditionally render login error:
        errorMessage && (
          <h3 className="error-message">{errorMessage}</h3>
        )
      }
    </div>
  );
}


export default LoginPage;
