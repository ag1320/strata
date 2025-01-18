import React, { useContext, useState } from "react";
import { AppContext } from "../../AppContext";
import { Grid, Card, Typography, IconButton, Stack } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "../../styling/StatsBanner.css";

const StatsBanner = ({mostPlayedGames, uniqueSessions, mostRecentlyPlayedGames}) => {
  // For toggling most played game in case of a tie
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  // For toggling most recently played game in case of multiple games played in one day
  const [currentRecentGameIndex, setCurrentRecentGameIndex] = useState(0);
  const { myGames, sessionData } = useContext(AppContext);

  //TOTAL PLAYS
  const totalPlays = uniqueSessions.length;

  // Handle Next/Previous for Most Played Game
  const handleNextGame = () => {
    setCurrentGameIndex((prevIndex) => (prevIndex + 1) % mostPlayedGames.length);
  };

  const handlePreviousGame = () => {
    setCurrentGameIndex(
      (prevIndex) => (prevIndex - 1 + mostPlayedGames.length) % mostPlayedGames.length
    );
  };

  // Handle Next/Previous for Most Recent Game
  const handleNextRecentGame = () => {
    setCurrentRecentGameIndex(
      (prevIndex) => (prevIndex + 1) % mostRecentlyPlayedGames.length
    );
  };

  const handlePreviousRecentGame = () => {
    setCurrentRecentGameIndex(
      (prevIndex) => (prevIndex - 1 + mostRecentlyPlayedGames.length) % mostRecentlyPlayedGames.length
    );
  };

  const currentGame = mostPlayedGames[currentGameIndex];
  const currentRecentGame = mostRecentlyPlayedGames[currentRecentGameIndex];

  return (
    <Card className="stats-banner">
      <Grid container>
        {/* Most Played Game Section */}
        <Grid item xs={4} className="stats-section">
          <Typography variant="h6" className="stats-title" color="white">
            Most Played Game
          </Typography>
          {mostPlayedGames.length === 1 ? (
            <div className="game-details">
              <img
                src={currentGame?.image}
                alt={currentGame?.name}
                className="game-image"
              />
              <Typography color="white">{currentGame?.name}</Typography>
              <Typography color="white">
                Total Plays: {currentGame?.totalPlays}
              </Typography>
            </div>
          ) : (
            <div className="game-details">
              <img
                src={currentGame?.image}
                alt={currentGame?.name}
                className="game-image"
              />
              <Typography color="white">{currentGame?.name}</Typography>
              <Typography color="white">
                Total Plays: {currentGame?.totalPlays}
              </Typography>
              <Stack direction={"row"} className="chevron-container">
                <IconButton
                  color="primary"
                  onClick={handlePreviousGame}
                  className="chevron-left"
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={handleNextGame}
                  className="chevron-right"
                >
                  <ChevronRightIcon />
                </IconButton>
              </Stack>
            </div>
          )}
        </Grid>

        {/* Total Game Plays Section */}
        <Grid item xs={4} className="stats-section total-plays-grid-item">
          <Typography variant="h6" className="stats-title" color="white">
            Total Game Plays
          </Typography>
          <div className="total-plays-container">
            <Typography color="white" variant="h1" className="total-plays-num">
              {totalPlays}
            </Typography>
          </div>
        </Grid>

        {/* Most Recently Played Section */}
        <Grid item xs={4} className="stats-section">
          <Typography variant="h6" className="stats-title" color="white">
            Most Recently Played
          </Typography>
          {mostRecentlyPlayedGames.length === 1 ? (
            <div className="game-details">
              <img
                src={currentRecentGame.image}
                alt={currentRecentGame.name}
                className="game-image"
              />
              <Typography color="white">{currentRecentGame.name}</Typography>
              <Typography color="white">
                Last Played:{" "}
                {new Date(currentRecentGame.mostRecentDate).toLocaleDateString()}
              </Typography>
            </div>
          ) : (
            <div className="game-details">
              <img
                src={currentRecentGame.image}
                alt={currentRecentGame.name}
                className="game-image"
              />
              <Typography color="white">{currentRecentGame.name}</Typography>
              <Typography color="white">
                Last Played:{" "}
                {new Date(
                  currentRecentGame.mostRecentDate
                ).toLocaleDateString()}
              </Typography>
              <Stack direction={"row"} className="chevron-container">
                <IconButton
                  color="primary"
                  onClick={handlePreviousRecentGame}
                  className="chevron-left"
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={handleNextRecentGame}
                  className="chevron-right"
                >
                  <ChevronRightIcon />
                </IconButton>
              </Stack>
            </div>
          )}
        </Grid>

      </Grid>
    </Card>
  );
};

export default StatsBanner;
