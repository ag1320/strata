import {
  Modal,
  Box,
  Grid,
  Autocomplete,
  TextField,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Chip,
  FormControlLabel,
  Switch,
  Button,
} from "@mui/material";
import "../../styling/LogPlayModal.css";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../AppContext";
import Teams from "./Teams";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import Players from "./Players";
import Winner from "./Winner";
import ShowMoreForms from "./ShowMoreForms";
import { postNewSession } from "../../helper-functions/serverCalls";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import enUS from 'date-fns/locale/en-US';


const LogPlayModal = ({ open, handleClose, defaultSelectedGame }) => {
  let [selectedGame, setSelectedGame] = useState(null);
  let [inputValue, setInputValue] = useState("");
  const [gameType, setGameType] = useState("competitive");
  const [selectedDate, setSelectedDate] = useState(new Date());
  let [soloError, setSoloError] = useState(false);
  let [activePlayers, setActivePlayers] = useState([]);
  let [deletedPlayerId, setDeletedPlayerId] = useState(-1);
  let [newPlayer, setNewPlayer] = useState({});
  // let [isHistoric, setIsHistoric] = useState(true);
  const [isShowMoreExpanded, setIsShowMoreExpanded] = useState(true);
  let [coopDidWin, setCoopDidWin] = useState(false);
  const [teamPlayers, setTeamPlayers] = useState({
    1: [...activePlayers], // Initially, all players are in Team 1
  });
  const [duration, setDuration] = useState("");
  const [winnerScore, setWinnerScore] = useState("");
  const [notes, setNotes] = useState("");

  let { myGames } = useContext(AppContext);
  let { refresh, setRefresh } = useContext(AppContext);
  let { setSnackbarError, setSnackbarSuccess } = useContext(AppContext);
  let { refreshSessions, setRefreshSessions} = useContext(AppContext)
  let { playersRefresh, setPlayersRefresh} = useContext(AppContext)

  useEffect(() => {
    if (defaultSelectedGame) {
      setSelectedGame(defaultSelectedGame);
      setInputValue(defaultSelectedGame.name);
    }
  }, [defaultSelectedGame]);

  const handleKeyDown = (event) => {
    if (event.key === "Tab") {
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

  const handleGameTypeChange = (event) => {
    setGameType(event.target.value);
  };

  // const handleHistoricToggleChange = () => {
  //   setIsHistoric(!isHistoric);
  // };

  const toggleShowMoreContent = () => {
    setIsShowMoreExpanded(!isShowMoreExpanded);
  };

  // Change handler for duration
  const handleDurationChange = (value) => {
    const parsedValue = parseInt(value, 10);
    setDuration(isNaN(parsedValue) ? 0 : parsedValue);
  };

  // Change handler for winner's score
  const handleWinnerScoreChange = (value) => {
    const parsedValue = parseInt(value, 10);
    setWinnerScore(isNaN(parsedValue) ? 0 : parsedValue);
  };

  const handleNotesChange = (value) => {
    setNotes(value);
  };

  const handleDeletePlayer = (player) => {
    //have to use an object in case the same player id is deleted
    //twice in a row. This method forces a re-render and registers a state change
    //as a new object is created every time
    setDeletedPlayerId({ id: player.id });
    setActivePlayers((prevActivePlayers) =>
      prevActivePlayers.filter((activePlayer) => activePlayer.id !== player.id)
    );
  };

  const handleCloseStates = () => {
    setInputValue("");
    setSelectedGame(null);
    setGameType("competitive");
    setSelectedDate(new Date());
    setActivePlayers([]);
    //setIsHistoric(true);
    setIsShowMoreExpanded(true);
    setCoopDidWin(false);
    setDuration("");
    setWinnerScore("");
    setNotes("");
    handleClose();
  };

  const handleSubmit = () => {
    if (gameType === "cooperative" && !coopDidWin) {
      setAllActivePlayersAsNotWinner();
    }

    if (
      !selectedGame ||
      !selectedDate ||
      !gameType ||
      !Array.isArray(activePlayers) ||
      activePlayers.length === 0
    ) {
      setSnackbarError(true);
      return;
    }

    postNewSession(
      selectedGame,
      gameType,
      coopDidWin,
      notes,
      selectedDate,
      //isHistoric,
      duration,
      winnerScore,
      activePlayers,
      refresh,
      setRefresh,
      setSnackbarError,
      setSnackbarSuccess,
      handleCloseStates,
      refreshSessions,
      setRefreshSessions,
      myGames,
      setPlayersRefresh,
      playersRefresh
    );
  };

  const setAllActivePlayersAsNotWinner = () => {
    setActivePlayers((prevPlayers) =>
      prevPlayers.map((player) => ({
        ...player,
        isWinner: false,
      }))
    );
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      if (gameType === "solo" && activePlayers.length > 1) {
        setSoloError(true);
      } else {
        setSoloError(false);
      }
    }
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType, activePlayers]);

  return (
    <Modal
      open={open}
      onClose={handleCloseStates}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="modal"
    >
      <Box className="modal-box-log-play">
        <div className="modal-content">
          <Grid container spacing={2} className="grid-container">
            <Grid item xs={12}>
              <Typography className="log-play-title" variant="h5">
                Log a Play
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <div className="line" />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2} className="grid-container">
                <Grid item xs={12}>
                  <Typography className="log-play-title" variant="h6">
                    Game
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    freeSolo
                    autoFocus
                    options={myGames.map((game) => game.name)}
                    value={inputValue}
                    onChange={(event, newValue) => {
                      setSelectedGame(
                        myGames.find((game) => game.name === newValue)
                      );
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
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <div className="line-container">
                    <div className="line-dim" />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <Typography className="log-play-title" variant="h6">
                    Date
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
                    <DatePicker
                      label="Select Date"
                      views={["year", "month", "day"]}
                      value={selectedDate}
                      onChange={(newDate) => setSelectedDate(newDate)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth variant="outlined" />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12}>
                  <div className="line-container">
                    <div className="line-dim" />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <Typography className="log-play-title" variant="h6">
                    Game Type
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="game-type-label">Game Type</InputLabel>
                    <Select
                      labelId="game-type-label"
                      value={gameType}
                      label="Game Type"
                      onChange={handleGameTypeChange}
                    >
                      <MenuItem value="competitive">
                        Competitive (free-for-all)
                      </MenuItem>
                      <MenuItem value="cooperative">Cooperative</MenuItem>
                      <MenuItem value="teams">Teams</MenuItem>
                      <MenuItem value="semi-cooperative">
                        Semi-Cooperative
                      </MenuItem>
                      <MenuItem value="solo">Solo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <div className="line-container">
                    <div className="line-dim" />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <Typography className="log-play-title" variant="h6">
                    Players
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Players
                    activePlayers={activePlayers}
                    setActivePlayers={setActivePlayers}
                    handleDeletePlayer={handleDeletePlayer}
                    gameType={gameType}
                    setNewPlayer={setNewPlayer}
                  />
                </Grid>
                {soloError && (
                  <Grid item xs={12}>
                    <Chip
                      label="Only 1 player for solo games"
                      className="solo-error-chip"
                      avatar={<PriorityHighIcon className="error-icon" />}
                    />
                  </Grid>
                )}
                {(gameType === "teams" ||
                  gameType === "cooperative" ||
                  gameType === "semi-cooperative") && (
                  <Grid item xs={12}>
                    <Teams
                      players={activePlayers}
                      gameType={gameType}
                      handleDeletePlayer={handleDeletePlayer}
                      teamPlayers={teamPlayers}
                      setTeamPlayers={setTeamPlayers}
                      deletedPlayerId={deletedPlayerId}
                      newPlayer={newPlayer}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <div className="line-container">
                    <div className="line-dim" />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <Typography className="log-play-title" variant="h6">
                    Winner(s)
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Winner
                    gameType={gameType}
                    activePlayers={activePlayers}
                    setActivePlayers={setActivePlayers}
                    teamPlayers={teamPlayers}
                    coopDidWin={coopDidWin}
                    setCoopDidWin={setCoopDidWin}
                    setAllActivePlayersAsNotWinner={
                      setAllActivePlayersAsNotWinner
                    }
                  />
                </Grid>
                {/*Add back in if I want the historic entry button */}
                {/* <Grid item xs={12}>
                  <div className="line-container">
                    <div className="line-dim" />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <Typography>Is this a historic entry?</Typography>
                  <FormControlLabel
                    className="historic-form"
                    control={
                      <Switch
                        className="historic-switch"
                        checked={isHistoric}
                        onChange={handleHistoricToggleChange}
                      />
                    }
                    label={isHistoric ? "Yes" : "No"}
                  />
                </Grid> */}
 
                <Grid item xs={12}>
                  <div className="line-container">
                    <div className="line-dim" />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div className="show-more-container">
                    <button
                      className="toggle-button"
                      onClick={toggleShowMoreContent}
                    >
                      {isShowMoreExpanded ? "Show Less" : "Show More"}
                      <span
                        className={`chevron ${
                          isShowMoreExpanded ? "expanded" : ""
                        }`}
                      >
                        &#9662;
                      </span>
                    </button>
                    <div
                      className={`content ${
                        isShowMoreExpanded ? "expanded" : "collapsed"
                      }`}
                    >
                      <ShowMoreForms
                        duration={duration}
                        winnerScore={winnerScore}
                        notes={notes}
                        onDurationChange={handleDurationChange}
                        onWinnerScoreChange={handleWinnerScoreChange}
                        onNotesChange={handleNotesChange}
                      />
                    </div>
                  </div>
                </Grid>
                <Grid item xs={12} className="plays-submit-button-container">
                  <Button
                    className="plays-submit-button"
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Box>
    </Modal>
  );
};

export default LogPlayModal;
