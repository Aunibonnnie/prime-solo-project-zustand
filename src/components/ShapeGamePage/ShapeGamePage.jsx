import useStore from '../../zustand/store'


function ShapeGamePage() {
  const user = useStore((state) => state.user);

  return (
    <>
      <h2>ShapeGame</h2>
      <p>Your username is: {user.username}</p>
      <p>Your ID is: {user.id}</p>
        <div>
          {/* Game content */}
        </div>
    </>
  );
}


export default ShapeGamePage;
