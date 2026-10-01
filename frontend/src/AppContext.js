import * as React from "react";

import { useState, createContext, useMemo } from "react";

export const AppContext = createContext(null);

function AppProvider({ children }) {
  const [hotGames, setHotGames] = useState([]);
  const [hotGamesDetailed, setHotGamesDetailed] = useState([]);
  const [myGames, setMyGames] = useState([]);
  const [attributeFilterChips, setAttributeFilterChips] = useState([]);
  const [snackbarSuccess, setSnackbarSuccess] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);
  const [groups, setGroups] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [players, setPlayers] = useState([]);
  const [playersRefresh, setPlayersRefresh] = useState(false);
  const [defaultGameForPlaysTab, setDefaultGameForPlaysTab] = useState({});
  const [refreshSessions, setRefreshSessions] = useState(false);
  const [sessionData, setSessionData] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistRefresh, setWishlistRefresh] = useState(false);

  const valueObj = useMemo(
    () => ({
      hotGames,
      setHotGames,
      hotGamesDetailed,
      setHotGamesDetailed,
      myGames,
      setMyGames,
      attributeFilterChips,
      setAttributeFilterChips,
      snackbarSuccess,
      setSnackbarSuccess,
      snackbarError,
      setSnackbarError,
      groups,
      setGroups,
      filterGroups,
      setFilterGroups,
      refresh,
      setRefresh,
      players,
      setPlayers,
      playersRefresh,
      setPlayersRefresh,
      defaultGameForPlaysTab,
      setDefaultGameForPlaysTab,
      refreshSessions,
      setRefreshSessions,
      sessionData,
      setSessionData,
      wishlist,
      setWishlist,
      wishlistRefresh,
      setWishlistRefresh,
    }),
    [
      hotGames,
      hotGamesDetailed,
      myGames,
      attributeFilterChips,
      snackbarSuccess,
      snackbarError,
      groups,
      filterGroups,
      refresh,
      players,
      playersRefresh,
      defaultGameForPlaysTab,
      refreshSessions,
      wishlist,
      wishlistRefresh,
    ]
  );

  return (
    <div className="App-provider">
      <AppContext.Provider value={valueObj}>{children}</AppContext.Provider>
    </div>
  );
}

export default AppProvider;
