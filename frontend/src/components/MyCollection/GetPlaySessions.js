import { useEffect, useContext } from "react";
import { AppContext } from "../../AppContext";
import { getSessions } from "../../helper-functions/serverCalls";

const GetPlaySessions = () => {
  const { setSessionData, refreshSessions } = useContext(AppContext);

  useEffect(() => {
    const fetchSessions = async () => {
      const data = await getSessions();
      setSessionData(data || []);
    };

    fetchSessions();
  }, [refreshSessions]);

  return null;
};

export default GetPlaySessions;
