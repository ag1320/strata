import { useContext, useState } from "react";
import { AppContext } from "../../AppContext";
import { Autocomplete, TextField, Grid, Chip } from "@mui/material";
import { postPlayer } from "../../helper-functions/serverCalls";
import "../../styling/Players.css"

const Players = ({ activePlayers, setActivePlayers, gameType, handleDeletePlayer, setNewPlayer }) => {
  let [selectedPlayer, setSelectedPlayer] = useState(null);
  let [playerInputValue, setPlayerInputValue] = useState("");

  let { players } = useContext(AppContext);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);
  let { playersRefresh, setPlayersRefresh } = useContext(AppContext);

  //Get options
  const activePlayerIds = new Set(activePlayers.map((player) => player.id));
  // Filter players to exclude those already in activePlayers
  const filteredPlayers = players.filter(
    (player) => !activePlayerIds.has(player.id)
  );
  const options = filteredPlayers.map(
    (player) => `${player.first_name} ${player.last_name}`
  );

  function findPlayerByFullName(fullName) {
    if (!fullName) {
      return null;
    }

    const [inputFirstName, inputLastName] = fullName
      .split(" ")
      .map((name) => name.trim());

    if (!inputFirstName || !inputLastName) {
      return null;
    }

    return (
      filteredPlayers.find(
        (player) =>
          player.first_name.toLowerCase() === inputFirstName.toLowerCase() &&
          player.last_name.toLowerCase() === inputLastName.toLowerCase()
      ) || null
    );
  }

  const addActivePlayer = () => {
    let playerObj = {};
    playerObj.id = selectedPlayer.id;
    playerObj.name = `${selectedPlayer.first_name} ${selectedPlayer.last_name}`;
    playerObj.isWinner = false;

    setNewPlayer({ ...playerObj })
    setActivePlayers([...activePlayers, playerObj]);
  };

  const handleChange = (event, newValue) => {
    setSelectedPlayer(findPlayerByFullName(newValue));
    setPlayerInputValue(newValue);
  };

  const findClosestPlayer = () => {
    const inputParts = playerInputValue
      .toLowerCase()
      .split(" ")
      .filter(Boolean);
    let closestPlayer = null;

    if (inputParts.length === 2) {
      const [inputFirstName, inputLastName] = inputParts;
      // Search for the exact first name and last name match
      closestPlayer = filteredPlayers.find(
        (player) =>
          player.first_name.toLowerCase().startsWith(inputFirstName) &&
          player.last_name.toLowerCase().startsWith(inputLastName)
      );
    }

    if (!closestPlayer) {
      // Fallback to searching by either first name or last name
      closestPlayer = filteredPlayers.find(
        (player) =>
          player.first_name
            .toLowerCase()
            .includes(playerInputValue.toLowerCase()) ||
          player.last_name
            .toLowerCase()
            .includes(playerInputValue.toLowerCase())
      );
    }

    return closestPlayer;
  };

  const handlePlayerSelect = async (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      let closestPlayer = findClosestPlayer();
      if (closestPlayer) {
        setSelectedPlayer(closestPlayer);
        setPlayerInputValue(
          `${closestPlayer.first_name} ${closestPlayer.last_name}`
        );
      }
    } else if (event.key === "Enter") {
      if (selectedPlayer) {
        addActivePlayer();
      } else {
        try {
          let newlyAddedPlayer = await postPlayer(
            playerInputValue,
            playersRefresh,
            setPlayersRefresh,
            setSnackbarError,
            setSnackbarSuccess
          );
          if (Object.keys(newlyAddedPlayer).length !== 0) {
            let newPlayerObj = {};
            newPlayerObj.id = newlyAddedPlayer.id;
            newPlayerObj.name = `${newlyAddedPlayer.first_name} ${newlyAddedPlayer.last_name}`;
            newPlayerObj.isWinner = false;

            setActivePlayers([...activePlayers, newPlayerObj]);
          }
        } catch {
          console.log("error adding player");
        }
      }
      setSelectedPlayer(null);
      setPlayerInputValue("");
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} className="player-grid-item">
        <Autocomplete
          freeSolo
          className="players-autocomplete"
          options={options}
          value={playerInputValue}
          onChange={(e, nv) => handleChange(e, nv)}
          onInputChange={(event, newInputValue) => {
            setPlayerInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Players"
              variant="outlined"
              onKeyDown={handlePlayerSelect}
            />
          )}
        />
      </Grid>
      {(gameType === "competitive" || gameType === "solo") && (
        <>
          <Grid item xs={12} className="player-grid-item">
            {activePlayers.map((player) => {
              return (
                <Chip
                  key={player.id}
                  label={player.name}
                  onDelete={() => handleDeletePlayer(player)}
                  className={`player-chip`}
                />
              );
            })}
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default Players;
