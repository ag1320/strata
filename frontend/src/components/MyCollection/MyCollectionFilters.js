import "../../styling/MyCollectionFilters.css";
import AttributeFilterChips from "./AttributeFilterChips";
import {
  Grid,
  InputBase,
  Typography,
  Stack,
  Switch,
  Badge,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
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
  let [openModal, setOpenModal] = useState(false);
  let [numFilters, setNumFilters] = useState(0);
  let [searchQuery, setSearchQuery] = useState(
    debouncedQuery ? debouncedQuery : ""
  );
  // Sort used to be a visible <Select> with its own "Sort By" label - now a
  // single icon that opens this menu, so the row reads as a cluster of
  // compact actions instead of competing for space with the search bar.
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
          {/* Redesigned again 2026-10-02 per feedback on the first pass:
              Filters/Clear All Filters/Sort By were still three separate
              text controls competing with the search bar for attention.
              All three are now icons (Sort opens a menu instead of showing
              a visible dropdown), joined in one compact row alongside the
              direction/favorite/dice icons that were already icon-only -
              the search bar is the only thing on the page with a visible
              text label now, and gets its own full-width row above this
              one so it reads as the primary action. */}
          <Grid item xs={12} className="search-container">
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
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              className="filter-icons-row"
            >
              <Tooltip title="Filters">
                <Badge badgeContent={numFilters} className="custom-badge">
                  <IconButton
                    onClick={handleOpenModal}
                    className="filter-icon-button"
                  >
                    <TuneIcon className="tune-icon" />
                  </IconButton>
                </Badge>
              </Tooltip>
              <Tooltip title="Clear All Filters">
                <IconButton
                  onClick={handleClearFilters}
                  className="filter-icon-button"
                >
                  <FilterAltOffIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={`Sort By: ${SORT_LABELS[sort] || "Rank"}`}>
                <IconButton
                  onClick={handleOpenSortMenu}
                  className="filter-icon-button"
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
              <Tooltip title={`${isAscending ? "Ascending" : "Descending"}`}>
                <IconButton onClick={handleSortOrderChange}>
                  {isAscending ? (
                    <NorthIcon className="sort-order-icon" />
                  ) : (
                    <SouthIcon className="sort-order-icon" />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Show Favorites">
                <IconButton onClick={handleFilterFavorite}>
                  <FavoriteIcon
                    className={`favorite-filter-icon ${
                      favoriteFilter ? "clicked" : ""
                    }`}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="Choose Random Game">
                <IconButton onClick={handleGetRandom}>
                  <CasinoIcon className="randomize-dice" />
                </IconButton>
              </Tooltip>
            </Stack>
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
