import { useEffect, useContext } from 'react';
import { AppContext } from '../../AppContext';
import { getGroups, fetchMyGames } from '../../helper-functions/serverCalls';

const GetMyCollection = () => {
  const { setMyGames, refresh, setGroups } = useContext(AppContext);


  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchMyGames();
      setMyGames(data);
    };

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

    //get groups
    useEffect(() => {
      let isMounted = true;
      if (isMounted) {
        getGroups().then((data) => {
          setGroups(data);
        });
      }
      return () => {
        isMounted = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh]);

  return null;
};

export default GetMyCollection;