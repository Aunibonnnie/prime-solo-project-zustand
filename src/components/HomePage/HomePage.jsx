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
      <h2 className="speech-bubble">Hi! {user.username}, what would you like to learn today?</h2>
      <div className="button-container">
        <div className="game-item">
          <img src='images/Untitled (37).png' />
          <button onClick={() => startGame('color')}>Colors</button>
        </div>
        <div className="game-item">
          <img src='images/Untitled (38).png' alt="Image for Shape Game" />
          <button onClick={() => startGame('shape')}>Shapes</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

{/* <button data-game_type="color" onClick={updateScore}>Play Color Game</button>
<button data-game_type="shape" onClick={updateScore}>Play Shape Game</button> */}



