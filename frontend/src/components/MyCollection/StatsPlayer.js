import {
  Card,
  Typography,
  Grid,
  List,
  ListItemText,
  ListItem,
} from "@mui/material";
import "../../styling/StatsPlayer.css";
import StatsPlayerSelection from "./StatsPlayerSelection";
import { useState, useEffect, useContext } from "react";
import { filterSessionsByPlayer } from "../../helper-functions/dataSanitization";
import { AppContext } from "../../AppContext";

const StatsPlayer = ({ uniqueSessions, handleSeePlays }) => {
  let [selectedPlayer, setSelectedPlayer] = useState(null);
  //let [ filteredSessions, setFilteredSessions] = useState([]);
  let { myGames } = useContext(AppContext);

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

  //BUGS I NEED TO FIX
  //ADD A NEW SESSION WITH A NEW PLAYER
  //IMMEDIATELY DELETE THAT SESSION
  //THE SESSION IS DELETED, BUT THE PLAYER IS IN THE DB STILL

  //2ND BUG
  //0% WIN PERCENTAGE AND OTHER EMPTY THINGS NOT DISPLAYING CORRECTLY

  const handleGameClick = (gameName) => {
    const selectedGame = myGames.find((game) => game.name === gameName);
    handleSeePlays(selectedGame);
  };

  console.log("selectedPlayer", selectedPlayer);

  return (
    <Card className="stats-card">
      <Typography className="stats-title">Player Stats</Typography>
      <StatsPlayerSelection
        selectedPlayer={selectedPlayer}
        setSelectedPlayer={setSelectedPlayer}
      />
      <Grid container spacing={1} className="player-stats-container">
        <Grid item xs={12}>
          <Typography variant="h5">{`Total Plays: ${selectedPlayer?.total_plays}`}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Most Played:</Typography>
          <List className="player-stats-list">
            {selectedPlayer?.top_three_games_by_num_plays.map((game) => (
              <ListItem
                key={game.name}
                onClick={() => handleGameClick(game.name)}
                className="player-stats-list-item"
              >
                <ListItemText
                  primary={`${game.name} (${game.total_plays})`}
                  className="player-stats-list-item-text"
                />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Most Recently Played:</Typography>
          <List className="player-stats-list">
            {selectedPlayer?.top_three_most_recent_games.map((game) => (
              <ListItem
                key={game.name}
                className="player-stats-list-item"
                onClick={() => handleGameClick(game.name)}
              >
                <ListItemText
                  className="player-stats-list-item-text"
                  primary={`${game.name} (${new Date(
                    game.most_recent_date
                  ).toLocaleDateString()})`}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">{`Overall Win Percentage: ${selectedPlayer?.win_percentage}%`}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">{`Games With the Highest Win Percentage (${selectedPlayer?.games_with_highest_win_percentage[0].winPercentage}%):`}</Typography>
        </Grid>
        {selectedPlayer?.games_with_highest_win_percentage.map((game) => {
          return (
            <Grid item xs={12}>
              <Typography variant="h5">{`${game.name} - ${game.winPercentage}%`}</Typography>
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
};

export default StatsPlayer;
