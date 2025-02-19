import React, { useEffect, useState } from 'react';
import useStore from '../../zustand/store';

function LeaderboardPage() {
  const user = useStore((state) => state.user);
  const [leaderboard, setLeaderboard] = useState([]);
  
  useEffect(() => {
    // Fetch top 5 leaderboard data for the color game
    fetch('/api/leaderboard')  // This is the route for fetching leaderboard
      .then((response) => response.json())
      .then((data) => {
        setLeaderboard(data);  // Store leaderboard data in state
      })
      .catch((error) => {
        console.error('Error fetching leaderboard data:', error);
      });
  }, []);  // Empty dependency array so it runs only once on mount

  return (
    <div>
      <h1>Leaderboard</h1>
      <div>
        <h2>Color Game Leaderboard</h2>
        {/* Display color game leaderboard as a table */}
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
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
        {/* Similar structure for shape game leaderboard (if applicable) */}
        {/* You can duplicate the code above to display shape leaderboard */}
      </div>
    </div>
  );
}

export default LeaderboardPage;

