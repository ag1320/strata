import { Autocomplete, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../AppContext";

const GameAutocomplete = ({
  defaultSelectedGame,
  selectedGame,
  setSelectedGame,
  inputValue,
  setInputValue,
}) => {
  let { myGames } = useContext(AppContext);

  const handleKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const closestOption = myGames.find((game) =>
        game.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      if (closestOption) {
        setSelectedGame(closestOption);
        setInputValue(closestOption.name);
      }
    }
    if (event.key === "Enter") {
      event.preventDefault();
      console.log(`you selected ${selectedGame.name}`);
    }
  };

  const handleFocus = () => {
    setSelectedGame({});
    setInputValue("");
  };

  useEffect(() => {
    if (defaultSelectedGame) {
      setSelectedGame(defaultSelectedGame);
      setInputValue(defaultSelectedGame.name);
    }
  }, [defaultSelectedGame]);

  return (
    <Autocomplete
      freeSolo
      autoFocus
      options={myGames.map((game) => game.name)}
      value={inputValue}
      onChange={(event, newValue) => {
        setSelectedGame(myGames.find((game) => game.name === newValue));
        setInputValue(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select a Game"
          variant="outlined"
          onKeyDown={(e) => handleKeyDown(e)}
          onFocus={handleFocus}
        />
      )}
    />
  );
};

export default GameAutocomplete;
