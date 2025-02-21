import useStore from '../../zustand/store'
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Ensure to import the CSS file

function HomePage() {
  const user = useStore((state) => state.user);
  const navigate = useNavigate();

  // Navigation functions
  const goToColorGamePage = () => {
    navigate('/color-game');
  };

  const goToShapeGamePage = () => {
    navigate('/shape-game');
  };

  return (
    <div className="home-container">
      <h2 className="speech-bubble">Hi! {user.username} user_id: {user.id} what would you like to learn today?</h2>
      <div className="button-container">
        <div className="game-item">
          <img src='https://fillmurray.lucidinternets.com/350/400' alt="Image for Color Game" />
          <button onClick={goToColorGamePage}>Color Game</button>
        </div>
        <div className="game-item">
          <img src='https://fillmurray.lucidinternets.com/350/400' alt="Image for Shape Game" />
          <button onClick={goToShapeGamePage}>Shape Game</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

{/* <button data-game_type="color" onClick={updateScore}>Play Color Game</button>
<button data-game_type="shape" onClick={updateScore}>Play Shape Game</button> */}



