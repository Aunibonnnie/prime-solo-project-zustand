import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useStore from '../../zustand/store';
import { XCircle } from 'phosphor-react';
import './ShapeGamePage.css';

function ShapeGamePage() {
  const user = useStore((state) => state.user);
  const [timeLeft, setTimeLeft] = useState(120);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedShape, setSelectedShape] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [mistakenShape, setMistakenShape] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const gameType = location.state?.gameType || 'shape';

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
    return 3;
  };

  const [shuffledShapes, setShuffledShapes] = useState([]);

  const shuffleShapes = () => {
    const blockCount = calculateBlocks(level);
    let shuffled = [];

    for (let i = 0; i < blockCount; i++) {
      const randomShape = shapeList[Math.floor(Math.random() * shapeList.length)];
      shuffled.push(randomShape);
    }

    const randomShape = shuffled[Math.floor(Math.random() * shuffled.length)];
    setSelectedShape(randomShape);

    shuffled = shuffled.sort(() => Math.random() - 0.5).map(shape => ({ shape, clicked: false }));
    setShuffledShapes(shuffled);
  };

  useEffect(() => {
    if (!user?.id) return;

    fetch('/api/leaderboard/reset-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, game_type: gameType }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setScore(0);
        setLevel(1);
      }
    })
    .catch(error => console.error("Error:", error));

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
  }, []);

  const updateScore = async () => {
    if (!score || score <= 0) return;

    try {
      const response = await fetch('/api/leaderboard/update-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, game_type: gameType, points: score }),
      });

      if (response.ok) {
        navigate('/leaderboard');
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleShapeClick = (index) => {
    if (gameOver) return;

    const updatedShapes = [...shuffledShapes];
    const clickedBlock = updatedShapes[index];

    if (clickedBlock.shape === selectedShape) {
      clickedBlock.clicked = true;
      setShuffledShapes(updatedShapes);

      if (updatedShapes.every(block => block.clicked || block.shape !== selectedShape)) {
        setLevel(prev => prev + 1);
        setScore(prev => prev + 1);
        setTimeLeft(prev => prev + 5);
        setMessage('Correct! Next level...');
        shuffleShapes();
      }
    } else {
      setMistakenShape(clickedBlock.shape);
      setGameOver(true);
      setMessage('Oops! Wrong shape. Game Over!');
      setShowModal(true);
    }
  };

  const restartGame = () => {
    fetch('/api/leaderboard/reset-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, game_type: gameType }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setScore(0);
        setTimeLeft(120);
        setLevel(1);
        setGameOver(false);
        setMessage('');
        setShowModal(false);
        shuffleShapes();
      }
    })
    .catch(error => console.error("Error:", error));
  };

  return (
    <div className="game-container">
      <h2>Welcome to the Shape Game!</h2>
      <p>Time Left: {timeLeft} seconds</p>
      <p>Level: {level}</p>
      <p>Score: {score}</p>
      <h3>Match the shape: {selectedShape}</h3>
      <div className="shape-block-container">
        {shuffledShapes.map((block, index) => (
          !block.clicked && (
            <div
              key={index}
              onClick={() => handleShapeClick(index)}
              className={`shape-block ${block.shape}`}
            ></div>
          )
        ))}
      </div>
      <p>{message}</p>
      {showModal && (
        <div className="modal">
          <h3>Oops! Try Again!</h3>
          <p>Incorrect shape clicked: {mistakenShape}</p>
          <p>Correct shape: {selectedShape}</p>
          <button onClick={updateScore}>End Game</button>
          <button onClick={restartGame}>Restart Game</button>
        </div>
      )}
    </div>
  );
}

export default ShapeGamePage;


