import { Card, Typography, Grid, Box, Stack } from "@mui/material";
import "../../styling/StatsPlayer.css";
import StatsPlayerSelection from "./StatsPlayerSelection";
import { useState, useEffect, useContext } from "react";
import { filterSessionsByPlayer } from "../../helper-functions/dataSanitization";
import { AppContext } from "../../AppContext";
import StatsHighestWinPercentageGames from "./StatsHighestWinPercentageGames";
import StatsPlayerMost from "./StatsPlayerMost";
import { PlayCircle, EmojiEvents } from "@mui/icons-material";
import { patchPlayerData } from "../../helper-functions/serverCalls";
import PersonIcon from "@mui/icons-material/Person";

const StatsPlayer = ({ uniqueSessions, handleSeePlays }) => {
  let [selectedPlayer, setSelectedPlayer] = useState(null);
  //let [ filteredSessions, setFilteredSessions] = useState([]);
  let { myGames } = useContext(AppContext);
  const { sessionData, players } = useContext(AppContext);

  // Filter sessions based on selectedPlayer
  //Might not need?
  // useEffect(() => {
  //   if (selectedPlayer) {
  //     setFilteredSessions(
  //       filterSessionsByPlayer(uniqueSessions, selectedPlayer)
  //     );
  //   } else {
  //     // Reset filteredSessions if no player is selected
  //     setFilteredSessions([]);
  //   }
  // }, [selectedPlayer, uniqueSessions]);

  const handleGameClick = (gameName) => {
    const selectedGame = myGames.find((game) => game.name === gameName);
    handleSeePlays(selectedGame);
  };

  const winPercentage = selectedPlayer?.win_percentage || 0;
  const totalPlays = selectedPlayer?.total_plays || 0;
  return (
    <Card className="stats-card">
      <div className="stats-title-stack-container">
        <Stack direction={"row"} className="stats-title-stack">
          <div className="stats-games-icon-container">
            <PersonIcon />
          </div>
          <Typography className="stats-title-by-season">
            Player Stats
          </Typography>
        </Stack>
      </div>

      <StatsPlayerSelection
        selectedPlayer={selectedPlayer}
        setSelectedPlayer={setSelectedPlayer}
      />
      <Grid container spacing={1} className="player-stats-container">
        {selectedPlayer ? (
          <>
            <Grid
              container
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              {/* Total Plays Card */}
              <Grid item xs={6}>
                <Box className="player-stats-total-plays-card">
                  <PlayCircle className="play-circle-icon" />
                  <Typography variant="h5" fontWeight="bold">
                    {`Total Plays: ${totalPlays}`}
                  </Typography>
                </Box>
              </Grid>

              {/* Win Percentage Card */}
              <Grid item xs={6}>
                <Box className="player-stats-win-percentage-card">
                  <EmojiEvents className="trophy-icon" />
                  <Typography variant="h5" fontWeight="bold" color={"green"}>
                    {`Overall Win Percentage: ${winPercentage}%`}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <div className="stats-line" />
            </Grid>
            <div className="player-stats-lists-container">
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    {/*1st of 2 columns. most played and most recent*/}
                    <StatsPlayerMost
                      selectedPlayer={selectedPlayer}
                      handleGameClick={handleGameClick}
                    />
                    {/*end 1st column*/}
                  </Grid>
                  <Grid item xs={6}>
                    {/*2nd of 2 columns. highest win percentage games*/}
                    <StatsHighestWinPercentageGames
                      games={
                        selectedPlayer?.games_with_highest_win_percentage || []
                      }
                      handleGameClick={handleGameClick}
                    />
                    {/*End 2nd column */}
                  </Grid>
                </Grid>
              </Grid>
            </div>
          </>
        ) : (
          <>{/*no player selected */}</>
        )}
      </Grid>
    </Card>
  );
};

export default StatsPlayer;
