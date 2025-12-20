import "../../styling/StatsGame.css";
import { Card, Grid, Stack, List, ListItem, ListItemText } from "@mui/material";
import { useContext, useState } from "react";
import CalculateIcon from '@mui/icons-material/Calculate';
import GameAutocomplete from "./GameAutocomplete";
import { AppContext } from "../../AppContext";
import {
  getSelectedGameSessions,
  getTopPlayersByNumPlays,
  getSelectedGameMostRecentDateString,
  getSelectedGameNumPlays,
  getWinnerScoreMetrics,
} from "../../helper-functions/dataSanitization";

const StatsGame = ({
  uniqueSessions,
  sortedGamesByNumPlays,
  sortedGamesByDate,
  handleSeePlays,
}) => {
  let [selectedGame, setSelectedGame] = useState(null);
  let [inputValue, setInputValue] = useState("");
  let { myGames, players } = useContext(AppContext);

  let mostRecentDateString = "";
  let numPlays = 0;
  let selectedGameSessions = [];
  let topPlayers = [];
  let winnerScoreMetrics = {};

  let defaultSelectedGameName = "Gutenberg";
  let defaultSelectedGame = myGames.find(
    (game) => game.name === defaultSelectedGameName
  );

  if (selectedGame && inputValue) {
    mostRecentDateString = getSelectedGameMostRecentDateString(
      sortedGamesByDate,
      selectedGame
    );
    numPlays = getSelectedGameNumPlays(sortedGamesByNumPlays, selectedGame);

    selectedGameSessions = getSelectedGameSessions(
      uniqueSessions,
      selectedGame
    );
    topPlayers = getTopPlayersByNumPlays(selectedGameSessions, players);

    winnerScoreMetrics = getWinnerScoreMetrics(selectedGameSessions);
  }

  return (
    <Card className="stats-card">
      <Grid container spacing={2}>
        {selectedGame && inputValue ? (
          <>
            <Grid item xs={4}>
              <h2 className="stats-title">{`Most Recent Play: ${mostRecentDateString}`}</h2>
            </Grid>
            <Grid item xs={4}>
              <div className="stats-title-stack-container">
                <Stack direction={"row"} className="stats-title-stack">
                  <div className="stats-games-icon-container">
                    <CalculateIcon />
                  </div>
                  <h2 className="stats-title">Stats By Game</h2>
                </Stack>
              </div>
            </Grid>
            <Grid item xs={4}>
              <h2 className="stats-title">{`Number of Plays: ${numPlays}`}</h2>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <div className="stats-title-stack-container">
              <Stack direction={"row"} className="stats-title-stack">
                <div className="stats-games-icon-container">
                  <CalculateIcon/>
                </div>
                <h2 className="stats-title">Stats By Game</h2>
              </Stack>
            </div>
          </Grid>
        )}
        <Grid item xs={12}>
          <GameAutocomplete
            defaultSelectedGame={defaultSelectedGame}
            selectedGame={selectedGame}
            setSelectedGame={setSelectedGame}
            inputValue={inputValue}
            setInputValue={setInputValue}
          />
        </Grid>
        {selectedGame && inputValue ? (
          <>
            <Grid item xs={4}>
              <List className="game-stats-list">
                <ListItem className="game-stats-list-item">
                  <ListItemText
                    primary="Most Plays"
                    className="game-stats-list-item-text"
                  />
                </ListItem>
                {topPlayers.map((player, index) => (
                  <ListItem key={player.id}>
                    <ListItemText
                      primary={`${index + 1} - ${player.first_name} ${
                        player.last_name
                      } (${player.numPlays})`}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={4}>
              <div
                className="stats-media-container"
                onClick={() => handleSeePlays(selectedGame)}
              >
                <img
                  src={selectedGame.image}
                  className="stats-media"
                  alt={selectedGame.name}
                />
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <h3>Winner Metrics</h3>
                <p>
                  <strong>Max Score:</strong>{" "}
                  {winnerScoreMetrics.maxWinnerScore}
                </p>
                <p>
                  <strong>Min Score:</strong>{" "}
                  {winnerScoreMetrics.minWinnerScore}
                </p>
                <p>
                  <strong>Mean Score:</strong>{" "}
                  {winnerScoreMetrics.meanWinnerScore}
                </p>
                <p>
                  <strong>Median Score:</strong>{" "}
                  {winnerScoreMetrics.medianWinnerScore}
                </p>
              </div>
            </Grid>
          </>
        ) : (
          <></>
        )}
      </Grid>
    </Card>
  );
};

export default StatsGame;
