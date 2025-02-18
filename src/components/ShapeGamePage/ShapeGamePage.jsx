import React, { useState, useEffect } from 'react';
import './ShapeGamePage.css';

function ShapeGamePage() {
  const [timeLeft, setTimeLeft] = useState(30); // 2 minutes = 120 seconds
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedShape, setSelectedShape] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [mistakenShape, setMistakenShape] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const shapeList = [
    'circle', 'square', 'rectangle', 'triangle', 'rhombus',
    'trapezoid', 'pentagon', 'hexagon', 'heptagon', 'octagon',
    'nonagon', 'decagon', 'parallelogram', 'kite', 'oval', 
    'star', 'crown', 'diamond'
  ];

  const calculateBlocks = (level) => {
    if (level >= 6 && level <= 10) return 5;
    if (level >= 11 && level <= 15) return 8;
    if (level >= 16 && level <= 20) return 12;
    if (level >= 21) return 20;
    return 3; // Default 3 blocks for levels 1-5
  };

  const [shuffledShapes, setShuffledShapes] = useState([]);
  const [targetShapeCount, setTargetShapeCount] = useState(0);

  const shuffleShapes = () => {
    const blockCount = calculateBlocks(level);
    let shuffled = [];

    for (let i = 0; i < blockCount; i++) {
      const randomShape = shapeList[Math.floor(Math.random() * shapeList.length)];
      shuffled.push(randomShape);
    }

    const randomShape = shuffled[Math.floor(Math.random() * shuffled.length)];
    setSelectedShape(randomShape);

    const targetShapeBlocks = Math.floor(Math.random() * 3) + 1; // 1 to 3 target shape blocks
    setTargetShapeCount(targetShapeBlocks);

    while (shuffled.filter(shape => shape === randomShape).length < targetShapeBlocks) {
      const randomIndex = Math.floor(Math.random() * shuffled.length);
      shuffled[randomIndex] = randomShape;
    }

    shuffled = shuffled.sort(() => Math.random() - 0.5);

    shuffled = shuffled.map(shape => ({
      shape,
      clicked: false,
      removed: false,  // New property to track if the shape is removed
    }));

    setShuffledShapes(shuffled);
  };

  useEffect(() => {
    if (gameOver) return;

    shuffleShapes();

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

  const handleShapeClick = (index) => {
    if (gameOver) return;

    const clickedBlock = shuffledShapes[index];
    if (clickedBlock.shape === selectedShape && !clickedBlock.clicked) {
      const updatedShapes = [...shuffledShapes];
      updatedShapes[index] = { ...clickedBlock, clicked: true, removed: true };  // Mark shape as removed
      setShuffledShapes(updatedShapes);

      const remainingUnclickedTargetBlocks = updatedShapes.filter(
        (block) => block.shape === selectedShape && !block.clicked
      );

      if (remainingUnclickedTargetBlocks.length === 0) {
        setScore(score + 1);
        setLevel(level + 1);
        setTimeLeft(timeLeft + 5);
        setMessage('Correct! Next level...');
        shuffleShapes();
      }
    } else if (clickedBlock.shape !== selectedShape) {
      setMistakenShape(clickedBlock.shape);
      setGameOver(true);
      setMessage('Oops! Wrong shape. Game Over!');
      setShowModal(true);
    }
  };

  const restartGame = () => {
    setTimeLeft(30);
    setLevel(1);
    setScore(0);
    setGameOver(false);
    setMessage('');
    setShowModal(false);
    shuffleShapes();
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
            <p>Incorrect shape clicked:</p>  
            <span className={`shape mistaken-shape ${mistakenShape}`}></span>
            <p>Correct shape to match:</p> 
            <span className={`shape correct-shape ${selectedShape}`}></span>
            <br />
            <button onClick={restartGame}>Restart Game</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="game-container">
      <h2>Shape Game</h2>
      <p>Time Left: {timeLeft} seconds</p>
      <p>Level: {level}</p>
      <p>Score: {score}</p>
      <h3>Match the shape: {selectedShape}</h3>
      <br />
      <div className={`selected-shape ${selectedShape}`}></div>
      <div className="shape-block-container">
        {shuffledShapes.map((block, index) => (
          !block.removed && !block.clicked && (  // Only render shapes that are not removed or clicked
            <div
              key={index}
              onClick={() => handleShapeClick(index)}
              className={`shape-block ${block.shape}`}
            ></div>
          )
        ))}
      </div>
      <p>{message}</p>
    </div>
  );
}

export default ShapeGamePage;


