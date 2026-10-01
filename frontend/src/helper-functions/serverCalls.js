import axios from "axios";
import {
  getGameIds,
  extractGameAttributes,
  removeLinks,
  groupSessions,
  getPlayerStats,
  addGameToSessions,
} from "./dataSanitization.js";
import CONFIG from "../config.js";

// The API now requires a session cookie (see AUTH.md) - the cookie only
// gets sent if every request opts in to credentials. Global axios default
// rather than a per-call option because every function below calls bare
// `axios.*`.
axios.defaults.withCredentials = true;

// Any *data* API call that comes back 401 means a previously-valid session
// died mid-use (expired token, logged out in another tab, or just never
// logged in). Bounce to /login with a full reload - this file has no
// router context, and it's the simplest thing that reliably works from a
// module that plain functions call into.
//
// /auth/me and /auth/login are excluded: RequireAuth and Login already
// handle their own 401s without a page reload, so letting this interceptor
// also fire for them would just add a redundant reload.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/me") || url.includes("/auth/login");
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// AUTH
async function login(username, password) {
  const res = await axios.post("http://localhost:3001/auth/login", {
    username,
    password,
  });
  return res.data;
}
async function logout() {
  const res = await axios.post("http://localhost:3001/auth/logout");
  return res.data;
}
async function fetchCurrentUser() {
  const res = await axios.get("http://localhost:3001/auth/me");
  return res.data;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// BGG queues collection/wishlist requests and responds 202 ("try again")
// until the result is ready. Retries with a short backoff instead of
// hammering immediately - an unthrottled tight retry loop is a plausible
// contributor to the BGG/Cloudflare bot-detection challenges seen while
// developing this app (see BACKEND_RESTRUCTURE.md). Throws on anything
// other than 200/202 instead of returning an empty result, so a real BGG
// failure is never indistinguishable from a genuinely empty collection.
async function pollBggEndpoint(fetchOnce, { maxAttempts = 5, delayMs = 1500 } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { status, data } = await fetchOnce();
    if (status === 200) return data;
    if (status !== 202) {
      throw new Error(`BGG request failed with status ${status}`);
    }
    if (attempt < maxAttempts) {
      await sleep(delayMs);
    }
  }
  throw new Error("BGG request timed out waiting for a queued result");
}

const getDetailedGamesFromUsername = async (username) => {
  let BGGGames = [];
  let detailedGames = [];

  try {
    BGGGames = await pollBggEndpoint(() => getBGGGames(username));
  } catch (err) {
    console.log(err);
    return {
      isError: true,
      errorMsg: "Error fetching collection from BGG",
      detailedGames: [],
    };
  }

  if (BGGGames.length === 0) {
    return {
      isError: true,
      errorMsg: "Error fetching collection from BGG",
      detailedGames: [],
    };
  }

  //extract ids
  const gameIds = getGameIds(BGGGames, false);

  //query bgg for more info on each game
  detailedGames = await getSpecificGamesDetailed(gameIds);

  if (detailedGames.length === 0) {
    return {
      isError: true,
      errorMsg:
        "Error fetching detailed games from BGG, check chunk size in server calls",
      detailedGames: [],
    };
  }

  //clean up the data
  detailedGames.map((game) => {
    game.attributes = extractGameAttributes(game);
    removeLinks(game);
    return game;
  });

  return { isError: false, errorMsg: "", detailedGames };
};

async function patchGameFavorite(game, favorite) {
  try {
    let payload = {
      game,
      favorite,
    };
    await axios.patch("http://localhost:3001/db-my-games-favorite", payload);
    return;
  } catch (err) {
    console.log(err);
    return;
  }
}

async function getHotGames() {
  try {
    let res = await axios.get("http://localhost:3001/hot-games");
    let games = res.data.items.item;
    return games;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function getFirstFiveGames(firstFiveHotGamesIds) {
  try {
    let payload = {
      gameIds: firstFiveHotGamesIds,
    };
    let res = await axios.get("http://localhost:3001/specific-games", {
      params: payload,
    });
    let games = res.data.items.item;
    return games;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function getFriends() {
  try {
    let payload = {
      username: CONFIG.BGG_USERNAME,
    };
    let res = await axios.get("http://localhost:3001/friends", {
      params: payload,
    });
    let friends = res.data.user.buddies;
    return friends;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function getFriendsGames(friends) {
  // Create a shallow copy of the array to avoid direct mutation
  const friendsCopy = [...friends];

  await Promise.all(
    friendsCopy.map(async (friend) => {
      friend.games = await getDetailedGamesFromUsername(friend.name);
    })
  );

  return friendsCopy;
}

async function postGamesGroups(inputs) {
  let gameId = -1;
  let groupId = -1;
  //.type===0 means the games_groups is getting posted from the groups tab
  //.type===1 means the games_groups is getting posted from the game card
  if (inputs.type === 0) {
    gameId = inputs.filteredGamesOptions.filter(
      (game) => game.name === inputs.selectedGame
    )?.[0]?.id;
    groupId = inputs.activeGroup.id;
  } else {
    gameId = inputs.gameId;
    groupId = inputs.groupId;
  }
  if (!gameId || !groupId) return;

  try {
    let payload = {
      gameId,
      groupId,
    };
    await axios
      .post("http://localhost:3001/db-games-groups", payload)
      .then(() => {
        inputs.setSnackbarSuccess(true);
        inputs.setRefresh(!inputs.refresh);
      });
    return;
  } catch (err) {
    console.log(err);
    inputs.setSnackbarError(true);
    return;
  }
}

async function patchGameRanks(games) {
  try {
    let payload = {
      games,
    };
    await axios.patch("http://localhost:3001/db-my-games-rank", payload);
    return;
  } catch (err) {
    console.log(err);
    return;
  }
}

async function getGroups() {
  try {
    let res = await axios.get("http://localhost:3001/db-groups");
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
}

//DB
const fetchMyGames = async () => {
  try {
    const res = await axios.get("http://localhost:3001/db-my-games");
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

//BGG
async function getBGGGames(username) {
  let res = await axios.get("http://localhost:3001/user-games", {
    params: { username },
  });
  return { status: res.status, data: res?.data?.items?.item || [] };
}

//BGG
async function getSpecificGamesDetailed(gameIds) {
  const chunkSize = 20;
  const gameIdChunks = [];

  for (let i = 0; i < gameIds.length; i += chunkSize) {
    gameIdChunks.push(gameIds.slice(i, i + chunkSize));
  }

  try {
    const promises = gameIdChunks.map((chunk) => {
      let payload = {
        gameIds: chunk,
      };
      return axios.get("http://localhost:3001/specific-games", {
        params: payload,
      });
    });

    const responses = await Promise.all(promises);
    let combinedGames = [];

    responses.forEach((res) => {
      if (res.data.items && res.data.items.item) {
        combinedGames = combinedGames.concat(res.data.items.item);
      }
    });
    return combinedGames;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function storeMyGames(games) {
  try {
    let payload = {
      games,
    };
    await axios.post("http://localhost:3001/db-my-games", payload);
    return;
  } catch (err) {
    console.log(err);
    return;
  }
}

async function postGroup(groupName, refresh, setRefresh) {
  try {
    let payload = {
      groupName,
    };
    await axios.post("http://localhost:3001/db-groups", payload);

    setRefresh(!refresh);
    return;
  } catch (err) {
    console.log(err);
    return;
  }
}

async function patchGroup(editId, groupName) {
  try {
    let payload = {
      editId,
      groupName,
    };
    await axios.patch("http://localhost:3001/db-groups", payload);
    return;
  } catch (err) {
    console.log(err);
    return;
  }
}

async function deleteGroup(
  activeGroupId,
  setActiveGroupId,
  group,
  refresh,
  setRefresh
) {
  if (activeGroupId === group.id) setActiveGroupId(-1);
  let payload = {
    params: {
      group,
    },
  };
  try {
    await axios.delete("http://localhost:3001/db-groups", payload);

    setRefresh(!refresh);
    return;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function deleteGamesGroups(
  groupId,
  gameId,
  refresh,
  setRefresh,
  setSnackbarError,
  setSnackbarSuccess
) {
  let payload = {
    params: {
      groupId,
      gameId,
    },
  };
  try {
    await axios.delete("http://localhost:3001/db-games-groups", payload);

    setRefresh(!refresh);
    setSnackbarSuccess(true);
    return;
  } catch (err) {
    console.log(err);
    setSnackbarError(true);
    return [];
  }
}

async function getPlayers() {
  try {
    let res = await axios.get("http://localhost:3001/db-players");
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function postPlayer(
  player,
  playersRefresh,
  setPlayersRefresh,
  setSnackbarError,
  setSnackbarSuccess
) {
  // Split the input by space
  let [playerFirstName, playerLastName] = player.split(" ");

  // Check for exact number of spaces (i.e., exactly two parts after split)
  if (player.split(" ").length !== 2) {
    console.log(
      "Error: Input must contain exactly one space separating first name and last name."
    );
    setSnackbarError(true);
    return;
  }

  // Validate that both first and last names are present
  if (!playerFirstName || !playerLastName) {
    console.log("Error: Both first name and last name are required.");
    setSnackbarError(true);
    return;
  }

  // Trim spaces from the names
  playerFirstName = playerFirstName.trim();
  playerLastName = playerLastName.trim();

  try {
    // Prepare the payload
    let payload = {
      first_name: playerFirstName,
      last_name: playerLastName,
    };

    // Make the API request
    let newlyAddedPlayer = await axios.post(
      "http://localhost:3001/db-players",
      payload
    );

    // Refresh players state and show success snackbar
    setPlayersRefresh(!playersRefresh);
    setSnackbarSuccess(true);
    return newlyAddedPlayer.data[0];
  } catch (err) {
    console.log(err);
    setSnackbarError(true);
    return {};
  }
}

async function postNewSession(
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
  handleClose,
  refreshSessions,
  setRefreshSessions,
  myGames,
  setPlayersRefresh,
  playersRefresh
) {
  try {
    let payload = {
      selectedGame,
      gameType,
      coopDidWin,
      notes,
      selectedDate,
      //isHistoric,
      duration,
      winnerScore,
      activePlayers,
    };
    await axios.post("http://localhost:3001/session", payload);
    const res = await axios.get(`http://localhost:3001/session`);
    const sessionData = res.data
    await patchPlayerData(sessionData, activePlayers, myGames);

    setRefresh(!refresh);
    setRefreshSessions(!refreshSessions);
    setPlayersRefresh(!playersRefresh);
    setSnackbarSuccess(true);
    handleClose();
    return;
  } catch (err) {
    setSnackbarError(true);
    console.log(err);
    return;
  }
}

const getSessions = async () => {
  try {
    const response = await axios.get(`http://localhost:3001/session`);
    return response.data;
  } catch (error) {
    console.error("Error fetching session data:", error);
  }
};

const deleteSession = async (
  sessionId,
  refreshSessions,
  setRefreshSessions,
  setSnackbarSuccess,
  setSnackbarError,
  myGames,
  setPlayersRefresh,
  playersRefresh
) => {
  let payload = {
    params: {
      sessionId,
    },
  };
  try {
    const res = await axios.delete("http://localhost:3001/session", payload);
    const playerData = res.data
    const res2 = await axios.get(`http://localhost:3001/session`);
    const sessionData = res2.data

    await patchPlayerData(sessionData, playerData, myGames)
    setRefreshSessions(!refreshSessions);
    setPlayersRefresh(!playersRefresh)
    setSnackbarSuccess(true);
    return;
  } catch (err) {
    console.log(err);
    setSnackbarError(true);
    return;
  }
};

const patchPlayerData = async (sessionData, activePlayers, myGames) => {
  try {
    //group sessions and attach games to sessions
    const uniqueSessions = groupSessions(sessionData);
    addGameToSessions(uniqueSessions, myGames);
    //post new player data for each players
    for (const selectedPlayer of activePlayers) {
      const playerData = getPlayerStats(
        uniqueSessions,
        selectedPlayer,
        myGames
      );
      await axios.patch("http://localhost:3001/db-players", playerData);
    }
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

async function getWishlist() {
  const items = await pollBggEndpoint(async () => {
    const res = await axios.get("http://localhost:3001/user-wishlist", {
      params: { username: CONFIG.BGG_USERNAME },
    });
    return { status: res.status, data: res.data?.items?.item || [] };
  });

  return items.map((item) => ({
    id: item.$.objectid,
    name: item.name?.[0]?._ || "",
    image: item.image?.[0] || item.thumbnail?.[0] || "",
    thumbnail: item.thumbnail?.[0] || item.image?.[0] || "",
    url: "https://boardgamegeek.com/boardgame/" + item.$.objectid,
    // BGG's collection XML uses <wishlistcomment>, not <comment>, for the
    // note attached to a wishlist entry - confirmed against a real response
    // (an item with no note at all omits the tag entirely, hence the `?.`).
    comment: item.wishlistcomment?.[0] || "",
  }));
}

export {
  login,
  logout,
  fetchCurrentUser,
  patchGameFavorite,
  getHotGames,
  getFirstFiveGames,
  postGamesGroups,
  patchGameRanks,
  getGroups,
  fetchMyGames,
  getSpecificGamesDetailed,
  storeMyGames,
  postGroup,
  patchGroup,
  deleteGroup,
  deleteGamesGroups,
  getPlayers,
  postPlayer,
  postNewSession,
  getSessions,
  deleteSession,
  getFriends,
  getDetailedGamesFromUsername,
  getFriendsGames,
  patchPlayerData,
  getWishlist,
};
