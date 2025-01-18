import "../../styling/Winner.css";
import { useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  FormControlLabel,
  Switch,
  Box,
  Grid,
} from "@mui/material";

const Winner = ({
  gameType,
  activePlayers,
  setActivePlayers,
  teamPlayers,
  coopDidWin,
  setCoopDidWin,
  setAllActivePlayersAsNotWinner
}) => {
  let [soloDidWin, setSoloDidWin] = useState(false);

  const handlePlayerChange = (event) => {
    setActivePlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === event.target.value
          ? { ...player, isWinner: true }
          : player
      )
    );
  };

  const handleDeletePlayer = (playerId) => {
    setActivePlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === playerId ? { ...player, isWinner: false } : player
      )
    );
  };

  const setAllActivePlayersAsWinner = () => {
    setActivePlayers((prevPlayers) =>
      prevPlayers.map((player) => ({
        ...player,
        isWinner: true,
      }))
    );
  };

  const handleCoopToggleChange = (event) => {
    setCoopDidWin(event.target.checked);

    if (gameType === "cooperative") {
      if (event.target.checked) {
        setAllActivePlayersAsWinner();
      } else {
        setAllActivePlayersAsNotWinner();
      }
    }
  };

  const handleSoloToggleChange = (event) => {
    setSoloDidWin(event.target.checked);

    if (event.target.checked) {
      setAllActivePlayersAsWinner();
    } else {
      setAllActivePlayersAsNotWinner();
    }
  };

  const handleTeamChange = (event) => {
    let winners = teamPlayers[event.target.value];

    setActivePlayers((prevActivePlayers) =>
      prevActivePlayers.map((player) => ({
        ...player,
        isWinner: winners.some((winner) => winner.id === player.id),
      }))
    );
  };

  return (
    <Grid container spacing={2}>
      {gameType === "competitive" && (
        <>
          <Grid item xs={12} className="winner-grid-item">
            <Typography className="winner-text" variant="h6">
              Select the Winner(s)
            </Typography>
          </Grid>
          <Grid item xs={12} className="winner-grid-item">
            <FormControl fullWidth>
              <InputLabel id="players-label">Players</InputLabel>
              <Select
                labelId="players-label"
                value={""}
                label="Players"
                onChange={handlePlayerChange}
              >
                {activePlayers.map((player) => {
                  return <MenuItem value={player.id}>{player.name}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Grid>
        </>
      )}

      {gameType === "cooperative" && (
        <>
          <Grid item xs={12} className="winner-grid-item">
            <Typography className="winner-text" variant="h6">
              Did the team win?
            </Typography>
          </Grid>
          <Grid item xs={12} className="winner-grid-item">
            <FormControlLabel
              className="win-form"
              control={
                <Switch
                  className="win-switch"
                  checked={coopDidWin}
                  onChange={handleCoopToggleChange}
                />
              }
              label={coopDidWin ? "Yes :)" : "No :("}
            />
          </Grid>
        </>
      )}

      {gameType === "semi-cooperative" && (
        <>
          <Grid item xs={12} className="winner-grid-item">
            <Typography className="winner-text" variant="h6">
              Did the team win?
            </Typography>
          </Grid>
          <Grid item xs={12} className="winner-grid-item">
            <FormControlLabel
              className="win-form"
              control={
                <Switch
                  className="win-switch"
                  checked={coopDidWin}
                  onChange={handleCoopToggleChange}
                />
              }
              label={coopDidWin ? "Yes :)" : "No :("}
            />
          </Grid>
          {coopDidWin && (
            <>
              <Grid item xs={12} className="winner-grid-item">
                <Typography className="winner-text" variant="h6">
                  Who was the ultimate Winner(s)?
                </Typography>
              </Grid>
              <Grid item xs={12} className="winner-grid-item">
                <FormControl fullWidth>
                  <InputLabel id="players-label">Players</InputLabel>
                  <Select
                    labelId="players-label"
                    value={"Select a Player to Add to the List of Winners"}
                    label="Players"
                    onChange={handlePlayerChange}
                  >
                    {activePlayers.map((player) => {
                      return (
                        <MenuItem value={player.id}>{player.name}</MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </>
      )}

      {gameType === "teams" && (
        <>
          <Grid item xs={12} className="winner-grid-item">
            <Typography className="winner-text" variant="h6">
              Select the Winning Team(s)?
            </Typography>
          </Grid>
          <Grid item xs={12} className="winner-grid-item">
            <FormControl fullWidth>
              <InputLabel id="teams-label">Teams</InputLabel>
              <Select
                labelId="teams-label"
                value={""}
                label="Teams"
                onChange={handleTeamChange}
              >
                {Object.keys(teamPlayers).map((team) => {
                  return <MenuItem value={team}>{`Team ${team}`}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Grid>
        </>
      )}

      {gameType === "solo" && (
        <>
          <Grid item xs={12} className="winner-grid-item">
            <Typography className="winner-text" variant="h6">
              Did you win?
            </Typography>
          </Grid>
          <Grid item xs={12} className="winner-grid-item">
            <FormControlLabel
              className="win-form"
              control={
                <Switch
                  className="win-switch"
                  checked={soloDidWin}
                  onChange={handleSoloToggleChange}
                />
              }
              label={soloDidWin ? "Yes :)" : "No :("}
            />
          </Grid>
        </>
      )}
      <Grid item xs={12} className="winner-grid-item">
        {activePlayers.map((player) => {
          if (player.isWinner) {
            if (
              (gameType === "semi-cooperative" || gameType === "cooperative") &&
              coopDidWin
            ) {
              return (
                <Chip
                  onDelete={() => handleDeletePlayer(player.id)}
                  key={player.id}
                  label={player.name}
                  className="player-chip-winner"
                />
              );
            } else if (
              !(gameType === "semi-cooperative" || gameType === "cooperative")
            )
              return (
                <Chip
                  onDelete={() => handleDeletePlayer(player.id)}
                  key={player.id}
                  label={player.name}
                  className="player-chip-winner"
                />
              );
          }
        })}
      </Grid>
    </Grid>
  );
};

export default Winner;