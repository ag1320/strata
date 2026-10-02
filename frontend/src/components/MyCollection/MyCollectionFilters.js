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
  Menu,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import SortIcon from "@mui/icons-material/Sort";
import FavoriteIcon from "@mui/icons-material/Favorite";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import { useState, useEffect } from "react";
import MyCollectionFiltersModal from "./MyCollectionFiltersModal";
import CasinoIcon from "@mui/icons-material/Casino";
import ClearIcon from '@mui/icons-material/Clear';

const SORT_LABELS = {
  rank: "Rank",
  playingTime: "Play Time",
  minPlayers: "Minimum Players",
  maxPlayers: "Maximum Players",
};

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
  const theme = useTheme();
  // Icon-only controls are a mobile-specific redesign (see render below) -
  // desktop keeps the original text chips + labeled dropdown, there's
  // plenty of width for them there and they were never the problem.
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  let [openModal, setOpenModal] = useState(false);
  let [numFilters, setNumFilters] = useState(0);
  let [searchQuery, setSearchQuery] = useState(
    debouncedQuery ? debouncedQuery : ""
  );
  // Only used on mobile, where Sort is an icon that opens this menu instead
  // of a visible <Select>.
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleOpenSortMenu = (event) => setSortMenuAnchor(event.currentTarget);
  const handleCloseSortMenu = () => setSortMenuAnchor(null);
  const handleSortChange = (value) => {
    setSort(value);
    handleCloseSortMenu();
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

  // Shared between the mobile and desktop layouts below - direction,
  // favorite, and randomize were already icon-only in both, so there's no
  // "mobile version" vs "desktop version" of these to maintain separately -
  // just a size, so all six icons in the mobile row (these three plus
  // Filters/Clear/Sort) are small enough to fit on one line even on a
  // 320px-wide phone.
  const renderQuickActionIcons = (size) => (
    <>
      <Tooltip title={`${isAscending ? "Ascending" : "Descending"}`}>
        <IconButton onClick={handleSortOrderChange} size={size}>
          {isAscending ? (
            <NorthIcon className="sort-order-icon" />
          ) : (
            <SouthIcon className="sort-order-icon" />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title="Show Favorites">
        <IconButton onClick={handleFilterFavorite} size={size}>
          <FavoriteIcon
            className={`favorite-filter-icon ${
              favoriteFilter ? "clicked" : ""
            }`}
          />
        </IconButton>
      </Tooltip>
      <Tooltip title="Choose Random Game">
        <IconButton onClick={handleGetRandom} size={size}>
          <CasinoIcon className="randomize-dice" />
        </IconButton>
      </Tooltip>
    </>
  );

  const searchBar = (
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
  );

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

        {isMobile ? (
          <>
            {/* Mobile: icons row first, search below it - a row of
                compact controls reads better above the thing you're about
                to type into than below it. */}
            <Grid item xs={12}>
              <Stack
                direction="row"
                spacing={0.5}
                flexWrap="nowrap"
                className="filter-icons-row"
              >
                <Tooltip title="Filters">
                  <Badge badgeContent={numFilters} className="custom-badge">
                    <IconButton
                      onClick={handleOpenModal}
                      className="filter-icon-button"
                      size="small"
                    >
                      <TuneIcon className="tune-icon" />
                    </IconButton>
                  </Badge>
                </Tooltip>
                <Tooltip title="Clear All Filters">
                  <IconButton
                    onClick={handleClearFilters}
                    className="filter-icon-button"
                    size="small"
                  >
                    <FilterAltOffIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={`Sort By: ${SORT_LABELS[sort] || "Rank"}`}>
                  <IconButton
                    onClick={handleOpenSortMenu}
                    className="filter-icon-button"
                    size="small"
                  >
                    <SortIcon />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={sortMenuAnchor}
                  open={Boolean(sortMenuAnchor)}
                  onClose={handleCloseSortMenu}
                >
                  {Object.entries(SORT_LABELS).map(([value, label]) => (
                    <MenuItem
                      key={value}
                      className="menu-item"
                      selected={value === sort}
                      onClick={() => handleSortChange(value)}
                    >
                      {label}
                    </MenuItem>
                  ))}
                </Menu>
                {renderQuickActionIcons("small")}
              </Stack>
            </Grid>
            <Grid item xs={12} className="search-container">
              {searchBar}
            </Grid>
          </>
        ) : (
          <>
            {/* Desktop: original text chips + labeled dropdown, side by
                side with the search bar - unchanged from before any of
                this mobile work started. */}
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} className="filter-chips-row">
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
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="select"
                    >
                      {Object.entries(SORT_LABELS).map(([value, label]) => (
                        <MenuItem
                          key={value}
                          value={value}
                          className="menu-item"
                        >
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                {renderQuickActionIcons()}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} className="search-container">
              {searchBar}
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <div className="line"></div>
        </Grid>
      </Grid>
    </>
  );
};

export default MyCollectionFilters;
