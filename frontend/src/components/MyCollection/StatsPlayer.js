import { Card, Typography, Grid, Button } from "@mui/material";
import "../../styling/StatsPlayer.css";
import StatsPlayerSelection from "./StatsPlayerSelection";
import { useState, useEffect, useContext } from "react";
import {
  getMostPlayed,
  getMostRecent,
  calculateWinPercentage,
  findGamesWithHighestWinPercentage,
} from "../../helper-functions/dataSanitization";
import { AppContext } from "../../AppContext";
import StatsGamesList from "./StatsGamesList";
import { patchPlayerData } from "../../helper-functions/serverCalls";

const StatsPlayer = ({ uniqueSessions, handleSeePlays }) => {
  let [selectedPlayer, setSelectedPlayer] = useState(null);
  let [filteredSessions, setFilteredSessions] = useState([]);
  let { myGames, players } = useContext(AppContext);
  const [mostPlayedGames, setMostPlayedGames] = useState([]);
  const [sortedGamesByNumPlays, setSortedGamesByNumPlays] = useState([]);
  const [mostRecentlyPlayedGames, setMostRecentlyPlayedGames] = useState([]);
  const [sortedGamesByDate, setSortedGamesByDate] = useState([]);
  const [winPercentage, setWinPercentage] = useState(0);
  const [highestWinGames, setHighestWinGames] = useState([]);

  // Filter sessions based on selectedPlayer
  useEffect(() => {
    if (selectedPlayer) {
      const filtered = uniqueSessions.filter((session) =>
        session.players.some((player) => player.playerId === selectedPlayer.id)
      );
      setFilteredSessions(filtered);
    } else {
      // Reset filteredSessions if no player is selected
      setFilteredSessions([]);
    }
  }, [selectedPlayer, uniqueSessions]);

  useEffect(() => {
    if (filteredSessions.length > 0) {
      const results = getMostPlayed(filteredSessions, myGames);
      setMostPlayedGames(results.mostPlayedGames);
      setSortedGamesByNumPlays(results.sortedGamesByNumPlays);

      const results2 = getMostRecent(filteredSessions, myGames);
      setMostRecentlyPlayedGames(results2.mostRecentlyPlayedGames);
      setSortedGamesByDate(results2.sortedGamesByDate);

      const results3 = calculateWinPercentage(filteredSessions, selectedPlayer);
      setWinPercentage(results3.winPercentage);
      setHighestWinGames(
        findGamesWithHighestWinPercentage(filteredSessions, selectedPlayer)
      );
    }
  }, [filteredSessions]);

  const handleExport = async () => {
    let rows = [];
    // Loop through each player
    for (const selectedPlayer of players) {
      let rowObj = {};
      rowObj.id = selectedPlayer.id
      // Find all the sessions for that player
      const filtSessions = uniqueSessions.filter((session) =>
        session.players.some((player) => player.playerId === selectedPlayer.id)
      );
  
      // Calculate top three games by the number of plays
      const { mostPlayedGames, sortedGamesByNumPlays } = getMostPlayed(
        filtSessions,
        myGames
      );
      rowObj.top_three_games_by_num_plays = JSON.stringify(
        sortedGamesByNumPlays.slice(0, 3).map((game) => ({
          name: game.name,
          total_plays: game.totalPlays,
        }))
      );
  
      // Calculate top three games by date
      const { mostRecentlyPlayedGames, sortedGamesByDate } = getMostRecent(
        filtSessions,
        myGames
      );
      rowObj.top_three_most_recent_games = JSON.stringify(
        sortedGamesByDate.slice(0, 3).map((game) => ({
          name: game.name,
          most_recent_date: game.mostRecentDate,
        }))
      );
  
      // Calculate the highest win percentage games
      const highestWinPercentageGames = findGamesWithHighestWinPercentage(
        filtSessions,
        selectedPlayer
      );
      rowObj.games_with_highest_win_percentage = JSON.stringify(
        highestWinPercentageGames
      );
  
      // Calculate total wins, win percentage, and total plays
      const { totalGames, totalWins, winPercentage } = calculateWinPercentage(
        filtSessions,
        selectedPlayer
      );
      rowObj.total_wins = totalWins;
      rowObj.win_percentage = winPercentage;
      rowObj.total_plays = totalGames;
  
      // Await the postPlayerData call
      await patchPlayerData(rowObj)
    }
  };

  console.log("players", players)
  
  

  return (
    <Card className="stats-card">
      <Typography className="stats-title">Player Stats</Typography>
      <StatsPlayerSelection
        selectedPlayer={selectedPlayer}
        setSelectedPlayer={setSelectedPlayer}
      />
      <Grid container spacing={1} className="player-stats-container">
        <Grid item xs={12}>
          <Typography variant="h5">{`Total Plays: ${filteredSessions.length}`}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">{`Most Played: ${mostPlayedGames
            .map((game) => game.name)
            .join(", ")}`}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">{`Most Recently Played: ${mostRecentlyPlayedGames
            .map((game) => game.name)
            .join(", ")}`}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">{`Win Percentage: ${winPercentage}%`}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">{`Games With the Highest Win Percentage:`}</Typography>
        </Grid>
        {highestWinGames.map((game) => {
          return (
            <Grid item xs={12}>
              <Typography variant="h5">{`${game.name} - ${game.winPercentage}%`}</Typography>
            </Grid>
          );
        })}
        <Grid item xs={6}>
          <StatsGamesList
            sortedGames={sortedGamesByNumPlays}
            handleSeePlays={handleSeePlays}
            title={"Most Played Games"}
          />
        </Grid>
        <Grid item xs={6}>
          <StatsGamesList
            sortedGames={sortedGamesByDate}
            handleSeePlays={handleSeePlays}
            title={"Most Recently Played Games"}
          />
        </Grid>

        <Grid item xs={12}>
          <Button onClick={handleExport}>export csv</Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default StatsPlayer;
