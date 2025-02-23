import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useStore from '../../zustand/store';
import { XCircle } from 'phosphor-react'; // Importing the XCircle icon
import { useNavigate } from 'react-router-dom';
import './ColorGamePage.css';

function ColorGamePage() {
  const user = useStore((state) => state.user);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes = 120 seconds
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [mistakenColor, setMistakenColor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const location = useLocation();
  const gameType = location.state?.gameType || 'color'; // Default to 'color'
  const navigate = useNavigate();
  
  const baseColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'brown', 'gray'];

  const calculateBlocks = (level) => {
    if (level >= 6 && level <= 10) return 5;
    if (level >= 11 && level <= 15) return 8;
    if (level >= 16 && level <= 20) return 12;
    if (level >= 21) return 20;
    return 3; // Levels 1-5 default to 3 blocks
  };

  const [shuffledColors, setShuffledColors] = useState([]);
  const [targetColorCount, setTargetColorCount] = useState(0);

  const shuffleColors = () => {
    const blockCount = calculateBlocks(level);
    let shuffled = [];

    for (let i = 0; i < blockCount; i++) {
      const randomColor = baseColors[Math.floor(Math.random() * baseColors.length)];
      shuffled.push(randomColor);
    }

    const randomColor = shuffled[Math.floor(Math.random() * shuffled.length)];
    setSelectedColor(randomColor);

    const targetColorBlocks = Math.floor(Math.random() * 3) + 1;
    setTargetColorCount(targetColorBlocks);

    while (shuffled.filter(color => color === randomColor).length < targetColorBlocks) {
      const randomIndex = Math.floor(Math.random() * shuffled.length);
      shuffled[randomIndex] = randomColor;
    }

    shuffled = shuffled.sort(() => Math.random() - 0.5).map(color => ({ color, clicked: false }));
    setShuffledColors(shuffled);
  };
  useEffect(() => {
    if (!user?.id) {
        console.error("User not found. Cannot reset score.");
        return;
    }

    // Reset leaderboard score when the game loads
    fetch('/api/leaderboard/reset-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, game_type: gameType }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Score reset successful on game start");
            setScore(0); // Reset local score immediately
            setLevel(1); // Reset level as well
        } else {
            console.error("Failed to reset score:", data.error);
        }
    })
    .catch(error => console.error("Error:", error));

    shuffleColors(); // Shuffle colors at game start

    const timer = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) {
                clearInterval(timer);
                setGameOver(true);
                setMessage('Time is up! Game Over!');
            }
            return prev - 1;
        });
    }, 1000);

    return () => clearInterval(timer);
}, []); // Empty dependency array ensures this runs **only once when the component mounts**


  const updateScore = async (gameType) => {
    if (!gameType) {
      console.error('Game type is missing!');
      return;
    }
    if (!score || score <= 0) {
      console.error('Score must be greater than 0 to be recorded.');
      return;
    }
  
    try {
      const response = await fetch('/api/leaderboard/update-score', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          game_type: gameType,
          points: score,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.success) {
        console.log('Score updated successfully:', data);
        navigate('/leaderboard'); // ✅ Redirect user to leaderboard
      } else {
        console.error('Failed to update score:', data.error);
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };
  

  const handleColorClick = (index) => {
    if (gameOver) return; // Stop clicks after game over
  
    const updatedColors = [...shuffledColors];
    const clickedBlock = updatedColors[index];
  
    if (clickedBlock.color === selectedColor) {
      // ✅ Correct color clicked
      clickedBlock.clicked = true;
      setShuffledColors(updatedColors);
  
      // Count remaining unclicked target color blocks
      const remainingUnclickedTargetBlocks = updatedColors.filter(
        (block) => block.color === selectedColor && !block.clicked
      );
  
      if (remainingUnclickedTargetBlocks.length === 0) {
        setLevel((prevLevel) => prevLevel + 1);
        setScore((prevScore) => prevScore + 1);
        setTimeLeft((prevTime) => prevTime + 5);
        setMessage('Correct! Next level...');
        shuffleColors();
      }
    } else {
      // ❌ Wrong color → Game Over
      setMistakenColor(clickedBlock.color);
      setGameOver(true);
      setMessage('Oopsie! Wrong color. Game Over!');
      setShowModal(true);
    }
  };
  
  

  const restartGame = () => {
    if (!user?.id) {
        console.error("User not found. Cannot reset score.");
        return;
    }

    fetch('/api/leaderboard/reset-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, game_type: gameType }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Score reset successful");
            setScore(0); // Reset local score
            setTimeLeft(120);
            setLevel(1);
            setGameOver(false);
            setMessage('');
            setShowModal(false);
            shuffleColors(); // Restart game visuals
        } else {
            console.error("Failed to reset score:", data.error);
        }
    })
    .catch(error => console.error("Error:", error));
};

  const closeInstructions = () => setShowInstructions(false);
  const openInstructions = () => setShowInstructions(true);

  if (gameOver) {
    return (
      <div className="game-over-container">
        <h2>Game Over</h2>
        <p>{message}</p>
        <p>Your final score: {score}</p>
        {showModal && (
          <div className="modal">
            <h3>Oops! Try Again!</h3>
            <p>Incorrect color clicked:</p>  
            <span className="mistaken-color" style={{ backgroundColor: mistakenColor }}></span>
            <p>Correct color to match:</p> 
            <span className="correct-color" style={{ backgroundColor: selectedColor }}></span>
            <br />
            <button onClick={() => {setGameOver(true);updateScore(gameType);}}>End Game</button>
            <button onClick={restartGame}>Restart Game</button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="game-container">
      {showInstructions && (
        <div className="instructions-modal">
          <div className="modal-content">
            <h3>How to Play</h3>
            <p>Match the color to the given text.</p> 
            <p>Example: Match The color BLUE</p>
            <img src="https://via.placeholder.com/150" alt="Game Example" />
            <button className="close-btn" onClick={closeInstructions}>
              <XCircle size={32} />
            </button>
          </div>
        </div>
      )}
      <h2>Welcome to the {gameType} Game!</h2>
      <p>Time Left: {timeLeft} seconds</p>
      <p>Level: {level}</p>
      <p>Score: {score}</p>
      <h3>Match the color: {selectedColor} <span className="instructions-icon" onClick={openInstructions}>❗</span></h3>
      <br />
      <span className="selected-color" style={{ '--selected-color': selectedColor }}></span>
      <div className="color-block-container">
        {shuffledColors.map((block, index) => (
          !block.clicked && ( 
            <div
              key={index}
              onClick={() => handleColorClick(index)}
              className="color-block"
              style={{ backgroundColor: block.color }}
            ></div>
          )
        ))}
      </div>
      <p>{message}</p>
    </div>
  );
}

export default ColorGamePage;





















