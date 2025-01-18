import "../../styling/MyCollectionFiltersModal.css";
import {
  Modal,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Box,
  Typography,
  Button,
  Stack,
  Slider,
  Checkbox,
  Tooltip,
  Chip,
  IconButton,
  Switch
} from "@mui/material";
import { useContext, useState } from "react";
import { AppContext } from "../../AppContext";
import GroupAutocomplete from "./GroupAutocomplete";
import CloseIcon from "@mui/icons-material/Close";

const MyCollectionFiltersModal = ({
  open,
  handleCloseModal,
  setGeneralFilters,
}) => {
  let [gameType, setGameType] = useState("both");

  let [playerRange, setPlayerRange] = useState([2, 5]);
  let [timeRange, setTimeRange] = useState([30, 120]);
  let [playerNumber, setPlayerNumber] = useState(4);
  let [time, setTime] = useState(90);
  let [isAnyPlaytimeSelected, setIsAnyPlaytimeSelected] = useState(true);
  let [isAnyPlayersSelected, setIsAnyPlayersSelected] = useState(true);
  let [playerType, setPlayerType] = useState("exactNumber");
  let [timeType, setTimeType] = useState("exactTime");
  let [isPlayerChecked, setIsPlayerChecked] = useState(false);
  const [groupInputValue, setGroupInputValue] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isAnd, setIsAnd] = useState(true)

  let { filterGroups, setFilterGroups } = useContext(AppContext);
  let { groups } = useContext(AppContext);

  const handleGameTypeChange = (e, newAlignment) => setGameType(newAlignment);
  const handlePlayerTypeChange = (e, newAlignment) => {
    if (playerType === "exactNumber") {
      setIsPlayerChecked(false);
    }
    setPlayerType(newAlignment);
  };
  const handleTimeTypeChange = (e, newAlignment) => setTimeType(newAlignment);

  const handleToggleChange = () =>{
    setIsAnd(!isAnd)
  }

  //sliders
  const handlePlayerChange = (event, value) => {
    if (Array.isArray(value)) {
      setPlayerRange(value);
    } else {
      setPlayerNumber(value);
      setPlayerRange([value, value]);
    }
  };
  const handleTimeChange = (event, value) => {
    if (Array.isArray(value)) {
      setTimeRange(value);
    } else {
      setTime(value);
      setTimeRange([value, value]);
    }
  };

  const handlePlayerCheckboxChange = (e) => {
    setIsPlayerChecked(e.target.checked);
  };

  const handleAnyPlaytimeButtonClick = () => {
    setIsAnyPlaytimeSelected(!isAnyPlaytimeSelected);
  };

  const handleAnyPlayersButtonClick = () => {
    setIsAnyPlayersSelected(!isAnyPlayersSelected);
  };

  const handleDeleteChip = (id) => {
    setFilterGroups(filterGroups.filter((group) => group.id !== id));
  };

  const handleGroupSelect = (event) => {
    let groupObj = {};
    if (event.key === "Tab") {
      event.preventDefault();
      const closestGroup = groups.find((group) =>
        group.name.toLowerCase().includes(groupInputValue.toLowerCase())
      );
      if (closestGroup) {
        setSelectedGroup(closestGroup.name);
        setGroupInputValue(closestGroup.name);
      }
    } else if (event.key === "Enter") {
      groupObj = groups.find((group) => group.name === selectedGroup);
      if (
        groupObj &&
        !filterGroups.some((group) => group.name === groupObj.name)
      ) {
        setFilterGroups([...filterGroups, groupObj]);
      }
      setSelectedGroup(null);
      setGroupInputValue("");
    }
  };

  const handleApplyFilters = () => {
    let outputObj = {};
    let playersObj = {};
    let timeObj = {};
    let filterGroupsObj = {};

    playersObj.isUsed = !isAnyPlayersSelected;
    if (playerType === "exactNumber") {
      playersObj.isExactMatchChecked = false;
    } else {
      playersObj.isExactMatchChecked = isPlayerChecked;
    }
    playersObj.range = playerRange;
    timeObj.isUsed = !isAnyPlaytimeSelected;
    timeObj.range = timeRange;

    filterGroupsObj.groups = filterGroups;
    filterGroupsObj.isAnd = isAnd

    outputObj.type = gameType;
    outputObj.players = playersObj;
    outputObj.time = timeObj;
    outputObj.filterGroups = filterGroupsObj;

    setGeneralFilters(outputObj);
    handleCloseModal();
  };

  return (
    <div className="modal-container">
      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="modal"
      >
        <Box className="modal-box">
          <div className="modal-content">
            <Grid container spacing={2} className="grid-container">
              <Grid item xs={12} className="grid-item">
                <Typography variant="body" className="text">
                  Filters
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <div className="modal-line" />
              </Grid>

              {/*GAME TYPE*/}
              <Grid item xs={12} className="grid-item">
                <Typography variant="h5" className="text">
                  Game Type
                </Typography>
              </Grid>
              <Grid item xs={12} className="grid-item">
                <ToggleButtonGroup
                  value={gameType}
                  exclusive
                  onChange={handleGameTypeChange}
                  aria-label="text alignment"
                  className="toggle-button-group"
                >
                  <ToggleButton value="expansions" aria-label="left aligned">
                    <Typography className="text">Expansions</Typography>
                  </ToggleButton>
                  <ToggleButton value="both" aria-label="right aligned">
                    <Typography className="text">Both</Typography>
                  </ToggleButton>
                  <ToggleButton value="boardgames" aria-label="centered">
                    <Typography className="text">Board Games</Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item xs={12}>
                <div className="modal-line" />
              </Grid>

              {/*PLAYERS*/}
              <Grid item xs={12} className="grid-item">
                <Typography variant="h5" className="text">
                  Players
                </Typography>
              </Grid>
              <Grid item xs={12} className="grid-item">
                <Button
                  className={`button ${isAnyPlayersSelected ? "selected" : ""}`}
                  onClick={handleAnyPlayersButtonClick}
                >
                  Any
                </Button>
              </Grid>
              {!isAnyPlayersSelected && (
                <>
                  <Grid item xs={12} className="grid-item">
                    <ToggleButtonGroup
                      value={playerType}
                      exclusive
                      onChange={handlePlayerTypeChange}
                      aria-label="text alignment"
                      className="toggle-button-group"
                    >
                      <ToggleButton
                        value="exactNumber"
                        aria-label="right aligned"
                      >
                        <Typography className="text">Plays At Least</Typography>
                      </ToggleButton>
                      <ToggleButton value="range" aria-label="left aligned">
                        <Typography className="text">Range</Typography>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>
                  {playerType === "range" ? (
                    <>
                      <Grid item xs={12} className="grid-item">
                        <Tooltip
                          title={
                            "If unchecked, the filter will return games included in the range"
                          }
                          placement="top"
                        >
                          <Stack direction={"row"} className="checkbox-stack">
                            <Checkbox
                              checked={isPlayerChecked}
                              onChange={handlePlayerCheckboxChange}
                              inputProps={{ "aria-label": "controlled" }}
                            />
                            <Typography variant="h6" className="text">
                              Match Range Exactly
                            </Typography>
                          </Stack>
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12} className="grid-item">
                        <Slider
                          value={playerRange}
                          onChange={(e, value) => handlePlayerChange(e, value)}
                          valueLabelDisplay="players"
                          min={1}
                          max={12}
                          step={1}
                          className="slider"
                        />
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12} className="grid-item">
                      <Slider
                        value={playerNumber}
                        onChange={(e, value) => handlePlayerChange(e, value)}
                        valueLabelDisplay="players"
                        min={1}
                        max={12}
                        step={1}
                        className="slider"
                        track={false}
                      />
                    </Grid>
                  )}
                </>
              )}
              <Grid item xs={12}>
                <div className="modal-line" />
              </Grid>

              {/*PLAYTIME*/}
              <Grid item xs={12} className="grid-item">
                <Typography variant="h5" className="text">
                  Playtime
                </Typography>
              </Grid>
              <Grid item xs={12} className="grid-item">
                <Button
                  className={`button ${
                    isAnyPlaytimeSelected ? "selected" : ""
                  }`}
                  onClick={handleAnyPlaytimeButtonClick}
                >
                  Any
                </Button>
              </Grid>
              {!isAnyPlaytimeSelected && (
                <>
                  <Grid item xs={12} className="grid-item">
                    <ToggleButtonGroup
                      value={timeType}
                      exclusive
                      onChange={handleTimeTypeChange}
                      aria-label="text alignment"
                      className="toggle-button-group"
                    >
                      <ToggleButton
                        value="exactTime"
                        aria-label="right aligned"
                      >
                        <Typography className="text">
                          Estimated Duration
                        </Typography>
                      </ToggleButton>
                      <ToggleButton value="range" aria-label="left aligned">
                        <Typography className="text">Range</Typography>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>
                  {timeType === "range" ? (
                    <>
                      <Grid item xs={11} className="grid-item">
                        <Slider
                          value={timeRange}
                          onChange={(e, value) => handleTimeChange(e, value)}
                          valueLabelDisplay="time"
                          min={0}
                          max={300}
                          step={30}
                          className="slider"
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={11} className="grid-item">
                        <Slider
                          value={time}
                          onChange={(e, value) => handleTimeChange(e, value)}
                          valueLabelDisplay="time"
                          min={0}
                          max={300}
                          step={30}
                          className="slider"
                          track={false}
                        />
                      </Grid>
                    </>
                  )}
                </>
              )}
              <Grid item xs={12}>
                <div className="modal-line" />
              </Grid>

              {/*GROUPS*/}
              <Grid item xs={12} className="grid-item">
                <Typography variant="h5" className="text">
                  Groups
                </Typography>
              </Grid>
              <Grid item xs={"auto"}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography className="text">OR</Typography>
                <Switch
                  checked={isAnd}
                  onChange={handleToggleChange}
                  classes={{
                    root: "ant-switch",
                    switchBase: "MuiSwitch-switchBase",
                    thumb: "MuiSwitch-thumb",
                    track: "MuiSwitch-track",
                    checked: "Mui-checked",
                  }}
                />
                <Typography className="text">AND</Typography>
              </Stack>
            </Grid>
              <Grid item xs={12} className="grid-item">
                <GroupAutocomplete
                  handleGroupSelect={handleGroupSelect}
                  setSelectedGroup={setSelectedGroup}
                  groupInputValue={groupInputValue}
                  setGroupInputValue={setGroupInputValue}
                  classNameToUse = {"group-autocomplete-filter-modal"}
                />
              </Grid>
              <Grid item xs={12} className="grid-item">
                {filterGroups.map((group, id) => {
                  return (
                    <Chip
                      key={id}
                      label={group.name}
                      onDelete={() => handleDeleteChip(group.id)}
                      deleteIcon={
                        <IconButton size="small">
                          <CloseIcon />
                        </IconButton>
                      }
                      variant="outlined"
                      className="filter-chip"
                    />
                  );
                })}
              </Grid>

              {/*ACTION BUTTONS*/}
              <Grid item xs={12} className="grid-button">
                <Stack spacing={2} direction={"row"}>
                  <Button className="button" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button className="button" onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default MyCollectionFiltersModal;
