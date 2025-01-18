import { useEffect, useContext } from 'react';
import { AppContext } from '../../AppContext';
import { getPlayers } from '../../helper-functions/serverCalls';

const GetPlayers = () => {
  const { setPlayers, playersRefresh } = useContext(AppContext);
  
  //get players from the db
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      getPlayers().then((items) => {
        setPlayers(items);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [playersRefresh]);

  return null;
};

export default GetPlayers;