import CONFIG from "../../config.js";
import React, { useEffect, useState, useContext, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppContext } from "../../AppContext.js";
import { Grid, Box, Button, Typography, Stack } from "@mui/material";
import logo from "../../images/strata-logo.png";
import GameCard from "./GameCard.js";
import "../../styling/MyCollection.css";
import SyncIcon from "@mui/icons-material/Sync";
import CheckIcon from "@mui/icons-material/Check";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import MyCollectionFilters from "./MyCollectionFilters.js";
import Filter1Icon from "@mui/icons-material/Filter1";
import { filterGames } from "../../helper-functions/dataSanitization.js";
import {
  getSpecificGamesDetailed,
  storeMyGames,
  getDetailedGamesFromUsername,
} from "../../helper-functions/serverCalls.js";
const EditRankingsModal = React.lazy(() => import("./EditRankingsModal"));

//attributes are hard coded in several places
//dataSanitization -> filterGamesByAttributes and filterGamesBySearch
//and game card htmls
//if adding more attributes, need to change all of these.

const MyCollection = ({ handleLogPlayClick, handleSeePlays }) => {
  let [isSyncing, setIsSyncing] = useState(false);
  let [showCheckmark, setShowCheckmark] = useState(false);
  let [showEx, setShowEx] = useState(false);
  let [isAnd, setIsAnd] = useState(false);
  let [debouncedQuery, setDebouncedQuery] = useState("");
  let [sort, setSort] = useState("rank");
  let [openEditRankingsModal, setOpenEditRankingsModal] = useState(false);
  let [favoriteFilter, setFavoriteFilter] = useState(false);
  let [isAscending, setIsAscending] = useState(true);

  let [generalFilters, setGeneralFilters] = useState({
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

  let { myGames } = useContext(AppContext);
  let { attributeFilterChips, setAttributeFilterChips } =
    useContext(AppContext);
  let { setFilterGroups } = useContext(AppContext);
  let { refresh, setRefresh } = useContext(AppContext);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);
  let { setPlayers, playersRefresh } = useContext(AppContext);

  //*********************************************
  //            SYNCHRONOUS FUNCTIONS
  //*********************************************
  const handleOpenEditRankingsModal = () => setOpenEditRankingsModal(true);
  const handleCloseEditRankingsModal = () => setOpenEditRankingsModal(false);

  const runSyncError = (message) => {
    console.error(message);
    setSnackbarError(true);
    setIsSyncing(false);
    setShowEx(true);
    setTimeout(() => {
      setShowEx(false);
    }, 2000); // Show ex mark for 2 seconds
    return;
  };

  const runSyncSuccess = () => {
    setSnackbarSuccess(true);

    setRefresh(!refresh);
    setIsSyncing(false);
    setShowCheckmark(true);
    setTimeout(() => {
      setShowCheckmark(false);
    }, 2000); // Show checkmark for 2 seconds
  };

  const updateCollection = async () => {
    setIsSyncing(true);
    try {
      let { isError, errorMsg, detailedGames } = await getDetailedGamesFromUsername(
        CONFIG.BGG_USERNAME
      );
      if (isError) {
        runSyncError(errorMsg);
        return
      }
      //store in db
      await storeMyGames(detailedGames);

      //animate
      runSyncSuccess();
    } catch (error) {
      runSyncError("Error updating collection:", error);
    }
  };

  const handleToggleChange = (event) => {
    setIsAnd(event.target.checked);
  };

  const { data: filteredGames, isLoading: isFilteredGamesLoading } = useQuery({
    queryFn: () =>
      filterGames({
        myGames,
        attributeFilterChips,
        isAnd,
        generalFilters,
        favoriteFilter,
        sort,
        isAscending,
        debouncedQuery,
      }),
    queryKey: [
      "filteredGames",
      {
        myGames,
        attributeFilterChips,
        isAnd,
        generalFilters,
        favoriteFilter,
        sort,
        isAscending,
        debouncedQuery,
      },
    ],
    enabled: myGames?.length > 0 || false,
  });

  //************************************
  //               RENDER
  //************************************
  return (
    <>
      <Box className="my-collection">
        <MyCollectionFilters
          attributeFilterChips={attributeFilterChips}
          isAnd={isAnd}
          handleToggleChange={handleToggleChange}
          setGeneralFilters={setGeneralFilters}
          setFilterGroups={setFilterGroups}
          setAttributeFilterChips={setAttributeFilterChips}
          generalFilters={generalFilters}
          sort={sort}
          setSort={setSort}
          favoriteFilter={favoriteFilter}
          setFavoriteFilter={setFavoriteFilter}
          isAscending={isAscending}
          setIsAscending={setIsAscending}
          setDebouncedQuery={setDebouncedQuery}
          debouncedQuery={debouncedQuery}
        />
        <Suspense fallback={<div>Loading...</div>}>
          <EditRankingsModal
            myGames={myGames}
            open={openEditRankingsModal}
            handleClose={handleCloseEditRankingsModal}
          />
        </Suspense>
        <Grid
          container
          direction="row"
          spacing={3}
          className="grid-container-bottom"
        >
          <Grid item xs={6}>
            <Stack direction={"row"} spacing={2}>
              <Button
                onClick={updateCollection}
                variant="contained"
                className="update-button"
                endIcon={
                  !showCheckmark && !showEx ? (
                    <SyncIcon
                      className={`sync-icon ${isSyncing ? "syncing" : ""}`}
                    />
                  ) : showCheckmark ? (
                    <CheckIcon className="check-icon" />
                  ) : (
                    <PriorityHighIcon className="exclamation-icon" />
                  )
                }
              >
                Sync Collection
              </Button>
              <Button
                onClick={handleOpenEditRankingsModal}
                variant="contained"
                className="update-button"
                endIcon={<Filter1Icon />}
              >
                Edit Rankings
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={6} alignItems="flex-end">
            <Typography textAlign="right">
              {`${filteredGames?.length} Results`}
            </Typography>
          </Grid>
          <>
            {isFilteredGamesLoading ? (
              <Grid item xs={12} className="strata-logo-container">
                <img src={logo} className="strata-logo-spinning" alt="logo" />
              </Grid>
            ) : (
              <>
                {filteredGames?.length === 0 ? (
                  <p>No Results, try broadening your serach</p>
                ) : (
                  filteredGames?.map((game, index) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={3}
                      lg={3}
                      key={game.id}
                      className="grid-item"
                    >
                      <GameCard
                        key={index}
                        game={game}
                        isExpandable={true}
                        handleLogPlayClick={handleLogPlayClick}
                        handleSeePlays={handleSeePlays}
                      />
                    </Grid>
                  ))
                )}
              </>
            )}
          </>
        </Grid>
      </Box>
    </>
  );
};

export default MyCollection;
