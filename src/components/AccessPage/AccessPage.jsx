import { useNavigate } from 'react-router-dom';
import './AccessPage.css';

function AccessPage () {
const navigate = useNavigate();

	// pushes to the add registration page
	const addRegisterPage = () => {
		navigate('/registration');
	};

  	// pushes to the add Login page
	const addLogInPage = () => {
		navigate('/login');
	};

  return (
    <>
      <div className='container'>
      <img src="images/vecteezy_alphabet-blocks-kids-education-toys-3d-illustrations_33535070.png"></img>
      <button onClick={addRegisterPage}>Create Account</button>
      <button onClick={addLogInPage}>LogIn</button>
      </div>
    </>
  );
}

export default AccessPage;