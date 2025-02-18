import useStore from '../../zustand/store'
import { useState, useEffect } from 'react';

function ColorGamePage() {
  const user = useStore((state) => state.user);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes = 120 seconds
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');

  const allColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const [shuffledColors, setShuffledColors] = useState([]);

  // Shuffle colors only when the level changes
  const shuffleColors = () => {
    const shuffled = [...allColors].sort(() => Math.random() - 0.5);
    setShuffledColors(shuffled);
  };

  // Start Game or Next Level Setup
  useEffect(() => {
    if (gameOver) return;

    // Pick a random color for the user to match
    const randomColor = allColors[Math.floor(Math.random() * allColors.length)];
    setSelectedColor(randomColor);

    // Shuffle colors for the new level
    shuffleColors();

    // Start Countdown Timer
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
  }, [level, gameOver, setTimeLeft, setSelectedColor, setGameOver, setMessage]);

  const handleColorClick = (color) => {
    if (gameOver) return;

    if (color === selectedColor) {
      setScore(score + 1);
      setLevel(level + 1);
      setTimeLeft(timeLeft + 10); // Gain extra time
      setMessage('Correct! Next level...');
    } else {
      setGameOver(true);
      setMessage('Oopsie! Wrong color. Game Over!');
    }
  };

  const restartGame = () => {
    setTimeLeft(120);
    setLevel(1);
    setScore(0);
    setGameOver(false);
    setMessage('');
    shuffleColors();
  };

  if (gameOver) {
    return (
      <div className="text-center">
        <h2>Game Over</h2>
        <p>{message}</p>
        <p>Your final score: {score}</p>
        <button onClick={restartGame}>Restart Game</button>
      </div>
    );
  }

  return (
    <>
    <h2>Color Game</h2>
    <div className="game-container">
      <h2>Color Game</h2>
      <p>Time Left: {timeLeft} seconds</p>
      <p>Level: {level}</p>
      <p>Score: {score}</p>
      <h3>Match the color: {selectedColor}</h3>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {shuffledColors.map((color) => (
          <div
            key={color}
            onClick={() => handleColorClick(color)}
            style={{
              width: '100px',
              height: '100px',
              margin: '10px',
              backgroundColor: color,
              cursor: 'pointer',
              borderRadius: '12px',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.transform = 'scale(1.1)')}
            onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
          ></div>
        ))}
      </div>
      <p>{message}</p>
    </div>
    </>
  );
}


export default ColorGamePage;
