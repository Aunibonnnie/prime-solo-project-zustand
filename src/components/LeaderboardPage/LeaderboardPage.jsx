import React, { useEffect, useState } from 'react';
import useStore from '../../zustand/store';
import './LeaderboardPage.css';

function LeaderboardPage() {
  const user = useStore((state) => state.user);
  const [colorLeaderboard, setColorLeaderboard] = useState([
    { username: 'User5', color_score: 15 },
    { username: 'User1', color_score: 8 },
    { username: 'User3', color_score: 4 },
    { username: 'User2', color_score: 2 },
    { username: 'User4', color_score: 1 },
  ]);
  const [shapeLeaderboard, setShapeLeaderboard] = useState([
    { username: 'User5', shape_score: 20 },
    { username: 'User1', shape_score: 12 },
    { username: 'User3', shape_score: 7 },
    { username: 'User4', shape_score: 3 },
    { username: 'User2', shape_score: 1 },
  ]);

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>
      <div>
        <h2>Color Game Leaderboard</h2>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {colorLeaderboard.map((entry, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{entry.username}</td>
                <td>{entry.color_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h2>Shape Game Leaderboard</h2>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {shapeLeaderboard.map((entry, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{entry.username}</td>
                <td>{entry.shape_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaderboardPage;
