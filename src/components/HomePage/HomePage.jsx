import { useState } from 'react';
import useStore from '../../zustand/store'
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Ensure to import the CSS file

function HomePage() {
  const [gameType, setGameType] = useState(''); // State to track the selected game type
  const user = useStore((state) => state.user);
  const navigate = useNavigate();

  // Navigation functions
  const goToColorGamePage = () => {
    navigate('/color-game');
  };

  const goToShapeGamePage = () => {
    navigate('/shape-game');
  };

// Function to start a game and navigate
const startGame = (type) => {
  setGameType(type); // Set the selected game type
  console.log(`Selected game type: ${type}`); // Logs game type before navigating
  navigate(`/${type}-game`, { state: { gameType: type } });
};

  return (
    <div className="home-container">
      <h2 className="speech-bubble">Hi! {user.username} user_id: {user.id} what would you like to learn today?</h2>
      <div className="button-container">
        <div className="game-item">
          <img src='https://fillmurray.lucidinternets.com/350/400' />
          <button onClick={() => startGame('color')}>Color Game</button>
        </div>
        <div className="game-item">
          <img src='https://fillmurray.lucidinternets.com/350/400' alt="Image for Shape Game" />
          <button onClick={() => startGame('shape')}>Shape Game</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

{/* <button data-game_type="color" onClick={updateScore}>Play Color Game</button>
<button data-game_type="shape" onClick={updateScore}>Play Shape Game</button> */}



