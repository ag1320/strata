import {
  Modal,
  Box,
  Grid,
  Autocomplete,
  TextField,
  Typography,
} from "@mui/material";
import "../../styling/AddGamesModal.css";
import { useContext, useState } from "react";
import { AppContext } from "../../AppContext";
import { postGamesGroups } from "../../helper-functions/serverCalls";
import { filterGameOptions } from "../../helper-functions/dataSanitization";

const AddGamesModal = ({ open, handleClose, activeGroup, filteredGames }) => {
  const { myGames } = useContext(AppContext);
  let { refresh, setRefresh } = useContext(AppContext);
  let { setSnackbarError, setSnackbarSuccess } = useContext(AppContext);
  const [inputValue, setInputValue] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);

  let filteredGamesOptions = filterGameOptions(myGames, filteredGames)

  const handleSubmit = (event) => {
    if (event.key === "Enter" && selectedGame) {
      event.preventDefault();
      let inputs = {
        filteredGamesOptions,
        selectedGame,
        activeGroup,
        refresh,
        setRefresh,
        setSnackbarError,
        setSnackbarSuccess,
      };
      inputs.type = 0;
      postGamesGroups(inputs).then(() => {
        setSelectedGame(null);
        setInputValue("");
      });
    }
  };


  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="modal"
    >
      <Box className="modal-box">
        <div className="modal-content">
          <Grid container spacing={2} className="grid-container">
            <Grid item xs={12}>
              <Typography className="add-games-title" variant="h5">
                {activeGroup.name}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <div className="line"></div>
            </Grid>
            <Grid item xs={12}>
              <Typography className="add-games-title">
                Press Tab to Select Enter to Submit
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                autoFocus
                options={filteredGamesOptions.map((game) => game.name)}
                value={inputValue}
                onChange={(event, newValue) => {
                  setSelectedGame(newValue);
                  setInputValue(newValue);
                }}
                onInputChange={(event, newInputValue) => {
                  setInputValue(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Games"
                    variant="outlined"
                    onKeyDown={(event) => {
                      if (event.key === "Tab") {
                        const closestOption = filteredGamesOptions.find((game) =>
                          game.name
                            .toLowerCase()
                            .includes(inputValue.toLowerCase())
                        );
                        if (closestOption) {
                          setSelectedGame(closestOption.name);
                          setInputValue(closestOption.name);
                        }
                      }
                      handleSubmit(event);
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </div>
      </Box>
    </Modal>
  );
};

export default AddGamesModal;
