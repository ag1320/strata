import { useContext } from "react";
import StatsBanner from "./StatsBanner";
import { AppContext } from "../../AppContext";
import {  Grid } from "@mui/material";
import StatsGamesList from "./StatsGamesList";
import StatsByYear from "./StatsByYear";
import { sanitizeSessions } from "../../helper-functions/dataSanitization";
import StatsBySeason from "./StatsBySeason";
import StatsPlayer from "./StatsPlayer";
import StatsLeaderboard from "./StatsLeaderboard";

const MyCollectionStats = ({ handleSeePlays }) => {
  const { sessionData, myGames, players } = useContext(AppContext);
  const {
    uniqueSessions,
    mostPlayedGames,
    sortedGamesByNumPlays,
    mostRecentlyPlayedGames,
    sortedGamesByDate,
  } = sanitizeSessions(sessionData, myGames);


  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StatsBanner
          mostPlayedGames={mostPlayedGames}
          uniqueSessions={uniqueSessions}
          mostRecentlyPlayedGames={mostRecentlyPlayedGames}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <StatsGamesList
          sortedGames={sortedGamesByNumPlays}
          handleSeePlays={handleSeePlays}
          title={"Most Played Games"}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <StatsGamesList
          sortedGames={sortedGamesByDate}
          handleSeePlays={handleSeePlays}
          title={"Most Recently Played Games"}
        />
      </Grid>
      <Grid item xs={12} md={12} lg={4}>
        <StatsByYear uniqueSessions={uniqueSessions} />
      </Grid>
      <Grid item xs={12} lg={4}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <StatsBySeason uniqueSessions={uniqueSessions} />
          </Grid>
          <Grid item xs={12}>
          <StatsLeaderboard/>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} lg={8}>
        <StatsPlayer
          uniqueSessions={uniqueSessions}
          handleSeePlays={handleSeePlays}
        />
      </Grid>

    </Grid>
  );
};

export default MyCollectionStats;
