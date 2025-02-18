import useStore from '../../zustand/store'


function LeaderboardPage() {
  const user = useStore((state) => state.user);

  return (
    <>
    <div>
      <h1>Leaderboard</h1>
      <div>
        <h2>Color Game Leaderboard</h2>
        {/* Display color game leaderboard */}
      </div>
      <div>
        <h2>Shape Game Leaderboard</h2>
        {/* Display shape game leaderboard */}
      </div>
    </div>
    </>
  );
}


export default LeaderboardPage;
