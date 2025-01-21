import React, { useContext, useState } from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack
} from "@mui/material";
import { AppContext } from "../../AppContext";
import "../../styling/StatsLeaderboard.css";
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

const StatsLeaderboard = () => {
  const { players } = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState("mostGamesPlayed");
  const playersPerPage = 5;

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Handle mode change
  const handleModeChange = (event) => {
    setMode(event.target.value);
    setCurrentPage(1); // Reset to first page when mode changes
  };

  // Sort players based on the selected mode
  const getSortedPlayers = () => {
    switch (mode) {
      case "mostGamesPlayed":
        return [...players]
          .sort((a, b) => b.total_plays - a.total_plays)
          .slice(0, 10);
      case "highestOverallWinPercentage":
        return [...players]
          .sort((a, b) => b.win_percentage - a.win_percentage)
          .slice(0, 10);
      case "mostWins":
        return [...players]
          .sort((a, b) => b.total_wins - a.total_wins)
          .slice(0, 10);
      default:
        return players.slice(0, 10);
    }
  };

  const sortedPlayers = getSortedPlayers();

  // Pagination logic
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = sortedPlayers.slice(
    indexOfFirstPlayer,
    indexOfLastPlayer
  );

  // Get display label for the data column
  const getDataLabel = () => {
    switch (mode) {
      case "mostGamesPlayed":
        return "Total Plays";
      case "highestOverallWinPercentage":
        return "Win Percentage";
      case "mostWins":
        return "Total Wins";
      default:
        return "";
    }
  };

  return (
    <Card className="stats-card" sx={{ padding: 2 }}>
      <div className="stats-title-stack-container">
        <Stack direction={"row"} className="stats-title-stack">
          <div className="stats-games-icon-container">
            <LeaderboardIcon />
          </div>
          <Typography className="stats-title-leaderboard">
            Leaderboard
          </Typography>
        </Stack>
      </div>

      {/* Dropdown for mode selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="leaderboard-mode-label">Mode</InputLabel>
        <Select
          labelId="leaderboard-mode-label"
          value={mode}
          onChange={handleModeChange}
        >
          <MenuItem value="mostGamesPlayed">Most Games Played</MenuItem>
          <MenuItem value="highestOverallWinPercentage">
            Highest Win Percentage
          </MenuItem>
          <MenuItem value="mostWins">Most Wins</MenuItem>
        </Select>
      </FormControl>

      {/* Leaderboard List */}
      <List className="leaderboard-stats-list">
        {currentPlayers.map((player, index) => (
          <ListItem key={player.id} className="leaderboard-stats-list-item">
            <ListItemText
              className="leaderboard-stats-list-item-text"
              primary={`#${index + 1 + (currentPage - 1) * playersPerPage} - ${
                player.first_name
              } ${player.last_name}`}
              secondary={`${getDataLabel()}: ${
                mode === "highestOverallWinPercentage"
                  ? `${player.win_percentage || 0}%`
                  : mode === "mostGamesPlayed"
                  ? player.total_plays
                  : player.total_wins
              }`}
            />
          </ListItem>
        ))}
      </List>

      {/* Pagination */}
      <Pagination
        count={Math.ceil(sortedPlayers.length / playersPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 2 }}
      />
    </Card>
  );
};

export default StatsLeaderboard;
