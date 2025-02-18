import useStore from '../../zustand/store'
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const user = useStore((state) => state.user);
  const navigate = useNavigate();  // Hook to get navigate function

// pushes to the add Guest page
const goToColorGamePage = () => {
  navigate('/color-game');
};

  const goToShapeGamePage = () => {
    navigate('/shape-game');  // Navigate to ShapeGamePage
  };

  return (
    <>
      <h2>ColorApp</h2>
      <h3>Logged in page...</h3>
      <p>Your username is: {user.username}</p>
      <p>Your ID is: {user.id}</p>
      <h3>Navigate to:</h3>
      <button onClick={goToColorGamePage}>Color Game</button>
      <button onClick={goToShapeGamePage}>Shape Game</button>
    </>
  );
}


export default HomePage;
