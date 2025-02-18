export const createGameSlice = (set) => ({
  timeLeft: 120,
  level: 1,
  score: 0,
  selectedColor: '',
  gameOver: false,
  message: '',
  shuffledColors: [],
  
  shuffleColors: () => {
    const shuffled = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'].sort(() => Math.random() - 0.5);
    set({ shuffledColors: shuffled });
  },
  
  setTimeLeft: (time) => set({ timeLeft: time }),  // Updating timeLeft
  setLevel: (level) => set({ level: level }),     // Updating level
  setScore: (score) => set({ score: score }),     // Updating score
  setGameOver: (gameOver) => set({ gameOver }),   // Updating gameOver
  setMessage: (message) => set({ message }),      // Updating message
  setSelectedColor: (color) => set({ selectedColor: color }), // Adding setSelectedColor
  
  submitScore: async () => {
    // Submit score logic (e.g., sending to a server)
    console.log('Submitting score:', get().score);
    // You can perform an axios request here to save the score
  },
});

export default createGameSlice;





