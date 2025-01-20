import React, { useState, useEffect, useContext } from "react";
import "../../styling/MyCollectionPlays.css";
import { getSessions, deleteSession } from "../../helper-functions/serverCalls";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Autocomplete,
  TextField,
  Stack,
  Switch,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import { AppContext } from "../../AppContext";

const MyCollectionPlays = ({ handleLogPlayClick }) => {
  
  const [expandedRows, setExpandedRows] = useState({});
  const [sortOrder, setSortOrder] = useState(null); // null | "asc" | "desc"
  let [selectedGame, setSelectedGame] = useState({});
  let [showHistoric, setShowHistoric] = useState(true);
  let [inputValue, setInputValue] = useState("");
  let { myGames } = useContext(AppContext);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);
  let{defaultGameForPlaysTab} = useContext(AppContext)
  let {refreshSessions, setRefreshSessions} = useContext(AppContext)
  let {playersRefresh, setPlayersRefresh} = useContext(AppContext)
  let {sessionData} = useContext(AppContext)

  let filteredSessions = [];
  let showCoopWin = false;
  let showWinnerScore = false;

  useEffect(() => {
    if (defaultGameForPlaysTab) {
      setSelectedGame(defaultGameForPlaysTab);
      setInputValue(defaultGameForPlaysTab.name);
    }
  }, [defaultGameForPlaysTab]);

  // Toggle collapse of a specific session row
  const handleRowClick = (sessionId) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [sessionId]: !prevState[sessionId],
    }));
  };

  // Filter session data by selectedGame.id
  if (selectedGame) {
    filteredSessions = sessionData.filter(
      (session) => session.gameId === selectedGame.id
    );
  }

  //group by sessionId
  const groupedSessions = filteredSessions.reduce((acc, session) => {
    if (!acc[session.sessionId]) {
      acc[session.sessionId] = { ...session, players: [] };
    }
    acc[session.sessionId].players.push(...session.players);
    return acc;
  }, {});

  const groupedSessionArray = Object.values(groupedSessions);
  let numSessions = groupedSessionArray.length;

  function getMostRecentDate(arr) {
    if (!arr || arr.length === 0) return;

    return arr.reduce((mostRecent, current) =>
      current.date > mostRecent.date ? current : mostRecent
    ).date;
  }

  let mostRecentDateObj = new Date(getMostRecentDate(groupedSessionArray));

  let mostRecentDate;
  if (isNaN(mostRecentDateObj)) {
    mostRecentDate = "N/A";
  } else {
    mostRecentDate = mostRecentDateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: 'UTC'
    });
  }

  const handleSortByDate = () => {
    setSortOrder((prevOrder) => {
      if (prevOrder === "asc") return "desc";
      if (prevOrder === "desc") return null;
      return "asc";
    });
  };

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

  const handleToggleChange = () => {
    setShowHistoric(!showHistoric);
  };

  const handleLogPlayButtonClick = () =>{
    selectedGame? handleLogPlayClick(selectedGame) : handleLogPlayClick()
  }

  const handleDelete = (sessionId) => {
    deleteSession(
      sessionId,
      refreshSessions,
      setRefreshSessions,
      setSnackbarSuccess,
      setSnackbarError,
      myGames,
      setPlayersRefresh,
      playersRefresh
    );
  };

  const sortedSessions = [...groupedSessionArray].sort((a, b) => {
    if (!sortOrder) return 0; // No sorting
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (sortOrder === "asc") return dateA - dateB;
    if (sortOrder === "desc") return dateB - dateA;

    return 0;
  });

  if (selectedGame) {
    // Determine if `winnerScore` column should be displayed
    showWinnerScore = sortedSessions.some((session) => session.winnerScore);

    // Determine if `coopWin` column should be displayed
    /*showCoopWin = ["cooperative", "semi-cooperative"].includes(
      selectedGame.type
    );
    */
    showCoopWin = sortedSessions.some(
      (session) =>
        session.gameType === "cooperative" ||
        session.gameType === "semi-cooperative"
    );
  }


  return (
    <Box className="my-collection-plays">
      <Grid container className="grid-container-plays">
        <Grid item xs={6} className="grid-item-plays" sx={{marginBottom: 5}}>
          <Button
            onClick={handleLogPlayButtonClick}
            className="fancy-button"
            startIcon={<span className="plus-icon">+</span>}
          >
            Add Play Session
          </Button>
        </Grid>
        <Grid item xs={6} className="grid-item-plays">
          <Box className="plays-search-box-container">
            <Autocomplete
              freeSolo
              className="plays-search-box"
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
                />
              )}
            />
          </Box>
        </Grid>
        {selectedGame ? (
          <Grid item xs={12} className="grid-item-plays">
            <div className="plays-media-container">
              <img
                src={selectedGame.image}
                className="plays-media"
                alt={selectedGame.name}
              />
            </div>
          </Grid>
        ) : (
          <></>
        )}
        

        {selectedGame ? (
          <>
            <Grid item xs={12} className="grid-item-plays">
              <Typography variant="h5" className="plays-text">
                {`Total Plays: ${numSessions}`}
              </Typography>
            </Grid>
            <Grid item xs={12} className="grid-item-plays">
              <Typography variant="h5" className="plays-text">
                {`Most Recent Play: ${mostRecentDate}`}
              </Typography>
            </Grid>
            <Grid item xs={12} className="grid-item-plays">
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch
                  checked={showHistoric}
                  onChange={handleToggleChange}
                  classes={{
                    root: "ant-switch",
                    switchBase: "MuiSwitch-switchBase",
                    thumb: "MuiSwitch-thumb",
                    track: "MuiSwitch-track",
                    checked: "Mui-checked",
                  }}
                />
                <Typography className="text">Show Historic</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} className="grid-item-plays">
              <TableContainer>
                <Table className="session-table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        onClick={handleSortByDate}
                        style={{ cursor: "pointer" }}
                      >
                        Date
                        {sortOrder === "asc" && " 🔼"} {/* Ascending */}
                        {sortOrder === "desc" && " 🔽"} {/* Descending */}
                      </TableCell>
                      <TableCell>Duration</TableCell>
                      {showWinnerScore ? (
                        <TableCell>Winner Score</TableCell>
                      ) : (
                        <></>
                      )}
                      {showCoopWin ? <TableCell>Co-op Win</TableCell> : <></>}
                      <TableCell>Players</TableCell>
                      {showHistoric ? <TableCell>Historic</TableCell> : <></>}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {sortedSessions.map((session) => (
                      <>
                        {!showHistoric && session.isHistoric ? (
                          <></>
                        ) : (
                          <React.Fragment key={session.sessionId}>
                            <TableRow
                              hover
                              onClick={() => handleRowClick(session.sessionId)}
                            >
                              <TableCell>
                                {new Date(session.date).toLocaleDateString('en-US', {timeZone: 'UTC'})}
                              </TableCell>
                              {session.duration ? (
                                <TableCell>
                                  {session.duration} minutes
                                </TableCell>
                              ) : (
                                <TableCell>-</TableCell>
                              )}
                              {showWinnerScore ? (
                                <TableCell>{session.winnerScore}</TableCell>
                              ) : (
                                <></>
                              )}
                              {showCoopWin ? (
                                <TableCell>
                                  {session.coopDidWin ? "Yes" : "No"}
                                </TableCell>
                              ) : (
                                <></>
                              )}

                              <TableCell>{session.players.length}</TableCell>
                              {showHistoric ? (
                                <TableCell>
                                  {session.isHistoric ? "Yes" : "No"}
                                </TableCell>
                              ) : (
                                <></>
                              )}
                            </TableRow>

                            <TableRow>
                              <TableCell colSpan={7} style={{ padding: 0 }}>
                                <Collapse
                                  in={expandedRows[session.sessionId]}
                                  timeout="auto"
                                  unmountOnExit
                                >
                                  <Box className="collapsed-table-container-players">
                                    <Typography variant="subtitle1">
                                      Players:
                                    </Typography>
                                    <Table size="small">
                                      <TableBody>
                                        {session.players.map((player) => (
                                          <TableRow key={player.playerId}>
                                            <TableCell>
                                              {player.firstName}{" "}
                                              {player.lastName}
                                            </TableCell>
                                            <TableCell align="right">
                                              {player.isWinner
                                                ? "Winner"
                                                : "Loser"}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </Box>
                                  <Box className="notes-and-delete-container">
                                    <Box>
                                      {session.notes ? (
                                        <>
                                          <Typography variant="subtitle1">
                                            Notes:
                                          </Typography>
                                          <Typography variant="body2">
                                            {session.notes}
                                          </Typography>
                                        </>
                                      ) : (
                                        <></>
                                      )}
                                    </Box>
                                    <Tooltip
                                      title="Delete This Play Session"
                                      placement="top"
                                    >
                                      <IconButton
                                        onClick={() =>
                                          handleDelete(session.sessionId)
                                        }
                                      >
                                        <DeleteIcon className="delete-session-icon" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </>
        ) : (
          <></>
        )}
      </Grid>
    </Box>
  );
};

export default MyCollectionPlays;
