import { useEffect, useState } from 'react';
import useStore from '../../zustand/store';
import './Leaderboardpage.css';

function LeaderboardPage() {
  const gameType = useStore((state) => state.gameType);
  const setGameType = useStore((state) => state.setGameType);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch(`/api/leaderboard/scores?game_type=${gameType}`)
      .then(res => res.json())
      .then(data => {
        console.log(`${gameType} Scores:`, data);
        setScores(data.data || []);
      })
      .catch(error => console.error("Error fetching scores:", error));
  }, [gameType]);

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Leaderboard</h2>
      <button 
        className="switch-button" 
        onClick={() => setGameType(gameType === "color" ? "shape" : "color")}
      >
        Switch to {gameType === "color" ? "Shape" : "Color"}
      </button>

      <h3>{gameType === "color" ? "Color Leaderboard" : "Shape Leaderboard"}</h3>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {scores.length > 0 ? (
            scores.map((score, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{score.username}</td>
                <td>{score[`${gameType}_score`] ?? 0}</td> {/* Corrected to dynamic field */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="no-scores">No scores available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LeaderboardPage;













// { username: 'User5', color_score: 15 },
// { username: 'User1', color_score: 8 },
// { username: 'User3', color_score: 4 },
// { username: 'User2', color_score: 2 },
// { username: 'User4', color_score: 1 },
// ]);
// const [shapeLeaderboard, setShapeLeaderboard] = useState([
// { username: 'User5', shape_score: 20 },
// { username: 'User1', shape_score: 12 },
// { username: 'User3', shape_score: 7 },
// { username: 'User4', shape_score: 3 },
// { username: 'User2', shape_score: 1 },
// ]);
