import { useContext } from "react";
import StatsBanner from "./StatsBanner";
import { AppContext } from "../../AppContext";
import { Grid } from "@mui/material";
import StatsGamesList from "./StatsGamesList";

//Most played year
//Most played season
//least played season
//games by year
//games by month
//average win score
//highest win score
//lowest win score
//By player - Games with most wins (as in which games does that person have the most signatures)

const MyCollectionStats = ({ handleSeePlays }) => {
  const { myGames, sessionData } = useContext(AppContext);

  // MOST PLAYED
  //group sessions by the sessionId
  //(there are multiple sessions entries from the same session to include multiple players)
  const groupedSessions = sessionData.reduce((acc, session) => {
    if (!acc[session.sessionId]) {
      acc[session.sessionId] = session;
    }
    return acc;
  }, {});

  //get the frequency of each game
  const uniqueSessions = Object.values(groupedSessions);
  const gameFrequency = uniqueSessions.reduce((acc, session) => {
    acc[session.gameId] = (acc[session.gameId] || 0) + 1;
    return acc;
  }, {});

  //sort the games by the number of total plays
  const sortGamesByNumberOfPlays = (gameFrequency) => {
    return myGames
      .slice()
      .map((game) => ({
        ...game,
        totalPlays: gameFrequency[game.id] || 0,
      }))
      .sort((a, b) => b.totalPlays - a.totalPlays);
  };
  const sortedGamesByNumPlays = sortGamesByNumberOfPlays(gameFrequency);

  //find the most played game(s)
  const maxPlays = sortedGamesByNumPlays[0]?.totalPlays || 0;
  const mostPlayedGames = sortedGamesByNumPlays.filter(
    (game) => game.totalPlays === maxPlays
  );
  // END MOST PLAYED

  //MOST RECENT PLAYS
  const sortGamesByDate = (uniqueSessions, myGames) => {
    // Create a frequency map of games with their corresponding dates
    const gameDates = uniqueSessions.reduce((acc, session) => {
      const game = myGames.find((game) => game.id === session.gameId);
      if (game) {
        acc[game.id] = acc[game.id] || [];
        acc[game.id].push(session.date);
      }
      return acc;
    }, {});

    // Sort the games by the most recent play date
    const sortedGamesByDate = myGames
      .slice()
      .map((game) => {
        const dates = gameDates[game.id] || [];
        const mostRecentDate = dates.length
          ? new Date(Math.max(...dates.map((date) => new Date(date))))
          : null;
        return {
          ...game,
          mostRecentDate,
        };
      })
      .sort((a, b) => b.mostRecentDate - a.mostRecentDate);

    return sortedGamesByDate;
  };
  const findMostRecentlyPlayedGames = (sortedGamesByDate) => {
    if (sortedGamesByDate.length === 0) return [];
    const mostRecentPlayTimestamp = sortedGamesByDate[0].mostRecentDate.getTime();
    const mostRecentlyPlayedGames = sortedGamesByDate.filter(
      (game) => {
        const gameTimestamp = game.mostRecentDate?.getTime();
        //ignore time by using only the date part
        return Math.floor(gameTimestamp / (1000 * 60 * 60 * 24)) === Math.floor(mostRecentPlayTimestamp / (1000 * 60 * 60 * 24));
      }
    );
  
    return mostRecentlyPlayedGames;
  };
  
  

  const sortedGamesByDate = sortGamesByDate(uniqueSessions, myGames);
  const mostRecentlyPlayedGames = findMostRecentlyPlayedGames(sortedGamesByDate);
  //END MOST RECENT PLAYS

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StatsBanner
          mostPlayedGames={mostPlayedGames}
          uniqueSessions={uniqueSessions}
          mostRecentlyPlayedGames={mostRecentlyPlayedGames}
        />
      </Grid>
      <Grid item xs={3}>
        <StatsGamesList
          sortedGames={sortedGamesByNumPlays}
          handleSeePlays={handleSeePlays}
          title={"Most Played Games"}
        />
      </Grid>
      <Grid item xs={3}>
        <StatsGamesList
          sortedGames={sortedGamesByDate}
          handleSeePlays={handleSeePlays}
          title={"Most Recently Played Games"}
        />
      </Grid>
    </Grid>
  );
};

export default MyCollectionStats;
