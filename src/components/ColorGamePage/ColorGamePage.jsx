import React, { useState, useEffect } from 'react';
import './ColorGamePage.css';

function ColorGamePage() {
  const [timeLeft, setTimeLeft] = useState(30); // 2 minutes = 120 seconds
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [mistakenColor, setMistakenColor] = useState(null); // Store mistaken color
  const [showModal, setShowModal] = useState(false); // Show or hide the pop-up modal
  const [showInstructions, setShowInstructions] = useState(false); // Show tutorial instructions

  const baseColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'brown', 'gray'];

  const calculateBlocks = (level) => {
    let blockCount = 3; // Default to 3 blocks for levels 1-5
    
    if (level >= 6 && level <= 10) {
      blockCount = 5; // Levels 6-10: 5 blocks
    } else if (level >= 11 && level <= 15) {
      blockCount = 8; // Levels 11-15: 8 blocks
    } else if (level >= 16 && level <= 20) {
      blockCount = 12; // Levels 16-20: 12 blocks
    } else if (level >= 21) {
      blockCount = 20; // Levels 21 and above: 20 blocks
    }

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

  const handleColorClick = (index) => {
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
        setScore(score + 1);
        setLevel(level + 1);
        setTimeLeft(timeLeft + 5);
        setMessage('Correct! Next level...');
        shuffleColors();
      }
    } else if (clickedBlock.color !== selectedColor) {
      setMistakenColor(clickedBlock.color); // Store the mistaken color
      setGameOver(true);
      setMessage('Oopsie! Wrong color. Game Over!');
      setShowModal(true); // Show the pop-up modal
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
            <p>Click on the blocks to match the selected color. Correct clicks will increase your score and move you to the next level!</p>
            <img src="https://via.placeholder.com/150" alt="Game Example" />
            <button className="close-btn" onClick={closeInstructions}>X</button>
          </div>
        </div>
      )}
      <h2>Color Game</h2>
      <p>Time Left: {timeLeft} seconds</p>
      <p>Level: {level}</p>
      <p>Score: {score}</p>
      <h3>Match the color: {selectedColor}</h3>
      <span className="instructions-icon" onClick={openInstructions}>❗</span> {/* The '!' icon */}
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
    </div>
  );
}

export default ColorGamePage;


















