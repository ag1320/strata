import { useEffect, useContext } from 'react';
import { AppContext } from '../../AppContext';
import { getPlayers } from '../../helper-functions/serverCalls';

const GetPlayers = () => {
  const { setPlayers, playersRefresh } = useContext(AppContext);

  function sortPlayersById(players) {
    return players.sort((a, b) => a.id - b.id);
  }
  
  
  //get players from the db
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      getPlayers().then((items) => {

        setPlayers(sortPlayersById(items));
      });
    }
    return () => {
      isMounted = false;
    };
  }, [playersRefresh]);

  return null;
};

export default GetPlayers;