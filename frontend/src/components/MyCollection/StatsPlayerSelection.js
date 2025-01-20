import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../AppContext";
import { Autocomplete, TextField, Grid } from "@mui/material";
import "../../styling/Players.css";

const StatsPlayerSelection = ({ setSelectedPlayer }) => {
  let [playerInputValue, setPlayerInputValue] = useState("");
  let { players } = useContext(AppContext);
  const options = players.map(
    (player) => `${player.first_name} ${player.last_name}`
  );

  let defaultPlayer = {
    id: 20,
    first_name: "Aaron",
    last_name: "Gettemy",
  };

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
      players.find(
        (player) =>
          player.first_name.toLowerCase() === inputFirstName.toLowerCase() &&
          player.last_name.toLowerCase() === inputLastName.toLowerCase()
      ) || null
    );
  }

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
      closestPlayer = players.find(
        (player) =>
          player.first_name.toLowerCase().startsWith(inputFirstName) &&
          player.last_name.toLowerCase().startsWith(inputLastName)
      );
    }

    if (!closestPlayer) {
      // Fallback to searching by either first name or last name
      closestPlayer = players.find(
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
    if (event.key === "Tab" || event.key === "Enter") {
      event.preventDefault();
      let closestPlayer = findClosestPlayer();
      if (closestPlayer) {
        setSelectedPlayer(closestPlayer);
        setPlayerInputValue(
          `${closestPlayer.first_name} ${closestPlayer.last_name}`
        );
      }
    }
  };

  useEffect(() => {
    //set defaults
    setSelectedPlayer(
      players.find((player) => {
        return (
          player.first_name === defaultPlayer.first_name &&
          player.last_name === defaultPlayer.last_name
        );
      })
    );
    setPlayerInputValue(
      `${defaultPlayer.first_name} ${defaultPlayer.last_name}`
    );
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} className="player-grid-item">
        <Autocomplete
          freeSolo
          className="players-autocomplete"
          options={options}
          value={playerInputValue}
          onFocus={() => {
            setSelectedPlayer(null);
            setPlayerInputValue("");
          }}
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
    </Grid>
  );
};

export default StatsPlayerSelection;
