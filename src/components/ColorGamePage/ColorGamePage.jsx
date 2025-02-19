import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XCircle } from 'phosphor-react'; // Importing the XCircle icon
import './ColorGamePage.css';
import useStore from '../../zustand/store';

function ColorGamePage() {
  // Color game state
  const [timeLeft, setTimeLeft] = useState(1130); // 2 minutes = 120 seconds
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [mistakenColor, setMistakenColor] = useState(null); // Store mistaken color
  const [showModal, setShowModal] = useState(false); // Show or hide the pop-up modal
  const [showInstructions, setShowInstructions] = useState(false); // Show tutorial instructions
  const user = useStore((state) => state.user);
  


  // Leaderboard state
 


  // Colors
  const baseColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'brown', 'gray'];

  // Fetch leaderboard data
  useEffect(() => {
    const fetchScores = async () => {
      try {
        // Fetch the current user's score
        const userScoreResponse = await axios.get('/api/score/current-user');  // Custom endpoint to fetch user score
        setUserScore(userScoreResponse.data.color_score);

        // Fetch the top 5 leaderboard scores
        const topFiveResponse = await axios.get('/api/score/top-five');  // Custom endpoint to fetch top 5 scores
        setTopFive(topFiveResponse.data);
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };

    fetchScores();
  }, []);

  // Color game logic
  const calculateBlocks = (level) => {
    let blockCount = 3; // Default to 3 blocks for levels 1-5
    if (level >= 6 && level <= 10) blockCount = 5;
    else if (level >= 11 && level <= 15) blockCount = 8;
    else if (level >= 16 && level <= 20) blockCount = 12;
    else if (level >= 21) blockCount = 20;
    return blockCount;
  };

  const [shuffledColors, setShuffledColors] = useState([]);
  const [targetColorCount, setTargetColorCount] = useState(0); // Track how many target color blocks there are

  const shuffleColors = () => {
    const blockCount = calculateBlocks(level);  // Get the number of blocks for the current level
    let shuffled = [];
    
    // Create shuffled array by picking colors from baseColors
    for (let i = 0; i < blockCount; i++) {
      const randomColor = baseColors[Math.floor(Math.random() * baseColors.length)];
      shuffled.push(randomColor);
    }

    const randomColor = shuffled[Math.floor(Math.random() * shuffled.length)];
    setSelectedColor(randomColor);

    const targetColorBlocks = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3 blocks of target color
    setTargetColorCount(targetColorBlocks);

    while (shuffled.filter(color => color === randomColor).length < targetColorBlocks) {
      const randomIndex = Math.floor(Math.random() * shuffled.length);
      shuffled[randomIndex] = randomColor;
    }

    shuffled = shuffled.sort(() => Math.random() - 0.5);
    
    shuffled = shuffled.map(color => ({
      color,
      clicked: false,
    }));

    setShuffledColors(shuffled);
  };

  useEffect(() => {
    if (gameOver) return;

    shuffleColors();

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
  }, [level, gameOver]);

  const handleColorClick = async (index) => {
    if (gameOver) return;

    const clickedBlock = shuffledColors[index];
    if (clickedBlock.color === selectedColor && !clickedBlock.clicked) {
        const updatedColors = [...shuffledColors];
        updatedColors[index] = { ...clickedBlock, clicked: true };
        setShuffledColors(updatedColors);

        const remainingUnclickedTargetBlocks = updatedColors.filter(
            (block) => block.color === selectedColor && !block.clicked
        );

        if (remainingUnclickedTargetBlocks.length === 0) {
            const newScore = score + 1;
            setScore(newScore);
            setLevel(level + 1);
            setTimeLeft(timeLeft + 5);
            setMessage('Correct! Next level...');
            shuffleColors();

            // Send score update to backend
            try {
                await axios.post('/api/score/update-score', {
                    userId: user?.id, // Assuming user ID is in Zustand
                    points: 1, // Increase by 1 per level
                });
            } catch (error) {
                console.error('Error updating score:', error);
            }
        }
    } else if (clickedBlock.color !== selectedColor) {
        setMistakenColor(clickedBlock.color);
        setGameOver(true);
        setMessage('Oopsie! Wrong color. Game Over!');
        setShowModal(true);
    }
};


  const restartGame = () => {
    setTimeLeft(30);
    setLevel(1);
    setScore(0);
    setGameOver(false);
    setMessage('');
    setShowModal(false); // Hide the modal
    shuffleColors();
  };

  const closeInstructions = () => {
    setShowInstructions(false);
  };

  const openInstructions = () => {
    setShowInstructions(true);
  };

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
              <XCircle size={32} /> {/* Phosphor's XCircle icon */}
            </button>
          </div>
        </div>
      )}
      <h2>Color Game</h2>
      <p>Time Left: {timeLeft} seconds</p>
      <p>Level: {level}</p>
      <p>Score: {score}</p>
      <h3>Match the color: {selectedColor} <span className="instructions-icon" onClick={openInstructions}>❗</span> {/* The '!' icon */}</h3>
      <br />
      <span
        className="selected-color"
        style={{
          '--selected-color': selectedColor, // Set the selectedColor dynamically in the CSS variable
        }}
      ></span>
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

      {/* Leaderboard Section */}
      <h2>Color Game Leaderboard</h2>
      <p>Your current score: {userScore}</p>
      <h3>Top 5 Players:</h3>
      <ul>
        {topFive.map((player, index) => (
          <li key={index}>
            {player.username}: {player.color_score}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ColorGamePage;





















