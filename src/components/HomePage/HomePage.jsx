import useStore from '../../zustand/store'


function HomePage() {
  const user = useStore((state) => state.user);

  return (
    <>
      <h2>ColorApp</h2>
      <h3>Logged in page...</h3>
      <p>Your username is: {user.username}</p>
      <p>Your ID is: {user.id}</p>
      <p>{JSON.stringify( user )}</p>
      <h3>ColorPage</h3>
      <h3>ShapePage</h3>
    </>
  );
}


export default HomePage;
