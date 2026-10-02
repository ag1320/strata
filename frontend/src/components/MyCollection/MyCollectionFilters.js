import "../../styling/MyCollectionFilters.css";
import AttributeFilterChips from "./AttributeFilterChips";
import {
  Grid,
  InputBase,
  Chip,
  Typography,
  Stack,
  Switch,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import FavoriteIcon from "@mui/icons-material/Favorite";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import { useState, useEffect } from "react";
import MyCollectionFiltersModal from "./MyCollectionFiltersModal";
import CasinoIcon from "@mui/icons-material/Casino";
import ClearIcon from '@mui/icons-material/Clear';


const MyCollectionFilters = ({
  attributeFilterChips,
  isAnd,
  handleToggleChange,
  setGeneralFilters,
  setAttributeFilterChips,
  setFilterGroups,
  generalFilters,
  sort,
  setSort,
  favoriteFilter,
  setFavoriteFilter,
  setIsAscending,
  isAscending,
  setDebouncedQuery,
  debouncedQuery,
}) => {
  let [openModal, setOpenModal] = useState(false);
  let [numFilters, setNumFilters] = useState(0);
  let [searchQuery, setSearchQuery] = useState(
    debouncedQuery ? debouncedQuery : ""
  );

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const handleFilterFavorite = () => {
    setFavoriteFilter(!favoriteFilter);
  };
  const handleSortOrderChange = () => {
    setIsAscending(!isAscending);
  };

  const handleGetRandom = () => {
    setGeneralFilters((prevState) => ({
      ...prevState,
      getRandom: !prevState.getRandom,
    }));
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearFilters = () => {
    setGeneralFilters({
      type: "both",
      players: {
        isUsed: false,
      },
      time: {
        isUsed: false,
      },
      filterGroups: {
        groups: [],
        isAnd: true,
      },
      getRandom: false,
    });
    setSearchQuery("");
    setAttributeFilterChips([]);
    setFavoriteFilter(false);
    setFilterGroups([]);
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      let numFiltersTemp = 0;
      if (generalFilters?.type !== "both") numFiltersTemp++;
      if (generalFilters?.players?.isUsed) numFiltersTemp++;
      if (generalFilters?.time?.isUsed) numFiltersTemp++;
      if (generalFilters?.filterGroups.groups.length > 0) numFiltersTemp++;
      setNumFilters(numFiltersTemp);
    }
    return () => {
      isMounted = false;
    };
  }, [generalFilters]);

  // debounce the search query
  // do not filter games until the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  return (
    <>
      <MyCollectionFiltersModal
        open={openModal}
        handleCloseModal={handleCloseModal}
        setGeneralFilters={setGeneralFilters}
      />
      <Grid
        container
        direction="row"
        spacing={1}
        className="grid-container-top"
      >
        {attributeFilterChips.length > 0 && (
          <>
            <Grid item xs={"auto"}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography>OR</Typography>
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
                <Typography>AND</Typography>
              </Stack>
            </Grid>
            <Grid item xs={11}>
              <AttributeFilterChips />
            </Grid>
          </>
        )}
        <>
          {/* Redesigned 2026-10-02: the old version wrapped 5 loose items
              (Filters/Clear chips, a 200px-min-width Sort box, a direction
              icon, a favorite icon) via generic Grid flex-wrap, and put the
              randomize dice in its own Stack next to a 70%-width search box
              under `justify-content: flex-end` - on a phone that left a
              hollow gap before the dice+search pair, and the favorite icon
              landing alone on whichever line it wrapped to. Replaced with
              three deliberate rows: chips, then sort+icon-actions grouped
              together, then a full-width search bar. */}
          <Grid item xs={12} sm={6}>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              className="filter-chips-row"
            >
              <Badge badgeContent={numFilters} className="custom-badge">
                <Chip
                  label={"Filters"}
                  variant="outlined"
                  className="open-filter-modal-chip"
                  onClick={handleOpenModal}
                  icon={<TuneIcon className="tune-icon" />}
                />
              </Badge>
              <Chip
                label={"Clear All Filters"}
                variant="outlined"
                className="clear-filters-chip"
                onClick={handleClearFilters}
              />
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              className="sort-controls-row"
            >
              <Box className="sort-box">
                <FormControl fullWidth className="form-control">
                  <InputLabel
                    id="demo-simple-select-label"
                    className="input-label"
                  >
                    Sort By
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={sort}
                    label="Sort"
                    onChange={handleSortChange}
                    className="select"
                  >
                    <MenuItem value={"rank"} className="menu-item">
                      Rank
                    </MenuItem>
                    <MenuItem value={"playingTime"} className="menu-item">
                      Play Time
                    </MenuItem>
                    <MenuItem value={"minPlayers"} className="menu-item">
                      Minimum Players
                    </MenuItem>
                    <MenuItem value={"maxPlayers"} className="menu-item">
                      Maximum Players
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Tooltip
                title={`${isAscending ? "Ascending" : "Descending"}`}
                placement="top"
              >
                <IconButton onClick={handleSortOrderChange}>
                  {isAscending ? (
                    <NorthIcon className="sort-order-icon" />
                  ) : (
                    <SouthIcon className="sort-order-icon" />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Show Favorites" placement="top">
                <IconButton onClick={handleFilterFavorite}>
                  <FavoriteIcon
                    className={`favorite-filter-icon ${
                      favoriteFilter ? "clicked" : ""
                    }`}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="Choose Random Game" placement="top">
                <IconButton onClick={handleGetRandom}>
                  <CasinoIcon className="randomize-dice" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} className="search-container">
            <div className="search">
              <InputBase
                placeholder="Search (by name, artists, keywords, etc.)…"
                className="inputRoot inputInput"
                inputProps={{ "aria-label": "search" }}
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
                style={{ flex: 1 }}
              />
              {searchQuery && (
                <IconButton onClick={() => setSearchQuery("")} size="small">
                  <ClearIcon />
                </IconButton>
              )}
              <IconButton>
                <SearchIcon />
              </IconButton>
            </div>
          </Grid>

          <Grid item xs={12}>
            <div className="line"></div>
          </Grid>
        </>
      </Grid>
    </>
  );
};

export default MyCollectionFilters;
