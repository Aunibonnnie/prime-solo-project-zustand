import { useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import useStore from '../../zustand/store';
import Nav from '../Nav/Nav';
import AccessPage from '../AccessPage/AccessPage';
import HomePage from '../HomePage/HomePage';
import LoginPage from '../LoginPage/LoginPage';
import RegisterPage from '../RegisterPage/RegisterPage';
import AccountPage from '../AccountPages/AccountPage';
import ColorGamePage from '../ColorGamePage/ColorGamePage';
import ShapeGamePage from '../ShapeGamePage/ShapeGamePage';
import LeaderboardPage from '../LeaderboardPage/LeaderboardPage';
import './App.css'; // Ensure to import the CSS file

function App() {
  const user = useStore((state) => state.user);
  const fetchUser = useStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
console.log('current user', user);

  return (
    <>
      <header>
        <h1>HodgePodge</h1>
        <Nav />
      </header>
      <main>
        <Routes>
          <Route 
            exact path="/"
            element={
              user.id ? (
                <HomePage /> // Render HomePage for authenticated user.
              ) : (
                <AccessPage /> // Redirect unauthenticated user.
              )
            }
          />
          <Route 
            exact path="/login"
            element={
              user.id ? (
                <Navigate to="/" replace /> // Redirect authenticated user.
              ) : (
                <LoginPage /> // Render LoginPage for unauthenticated user.
              )
            }
          />
        <Route path="/" element={<HomePage />} />  {/* Correct JSX syntax */}
        <Route path="/color-game" element={<ColorGamePage />} />  {/* Correct JSX syntax */}
        <Route path="/shape-game" element={<ShapeGamePage />} />  {/* Correct JSX syntax */}
        <Route path="/leaderboard" element={<LeaderboardPage />} />  {/* Correct JSX syntax */}
        <Route path="/access" element={<AccessPage />} />  {/* Correct JSX syntax */}
<Route 
  path="/account"
  element={user ? <AccountPage /> : <Navigate to="/login" replace />} 
/>
          <Route 
            exact path="/registration"
            element={
              user.id ? (
                <Navigate to="/" replace /> // Redirect authenticated user.
              ) : (
                <RegisterPage /> // Render RegisterPage for unauthenticated user.
              )
            }
          />
          <Route 
            exact path="/about"
            element={
              <>
              <div classname="container">
                <img src="images/vecteezy_alphabet-blocks-kids-education-toys-3d-illustrations_33535070.png"></img>
                <p>
                Learn and compete! Find and match the colors and shapes as fast as you can before time runs out. 
                The more you progress the harder it gets, join with a friend and compete online to obtain the highest score on the leaderboard. 
                Teaching kids from ages 3-6 to develop their creative minds to learn colors and shapes.
                </p>
                <p>
                  --From Aunika Lewis <em>Prime:North Cascades</em>.
                </p>
                <p>
                  Made with Node, React, API, SQL and ChatGPT
                </p>
                </div>
              </>
            }
          />
          <Route
            path="*"
            element={
              <h2>404 Page</h2>
            } 
          />
        </Routes>
      </main>
      <footer>
        <p>Copyright © {new Date().getFullYear()}</p>
      </footer>
    </>
  );
}


export default App;
