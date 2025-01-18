import axios from "axios";
import { getGameIds, extractGameAttributes, removeLinks } from "./dataSanitization.js";
import CONFIG from "../config.js"

const getDetailedGamesFromUsername = async (username) =>{
  let statusCode = 202;
  let BGGGames = [];
  let detailedGames = [];

  //bgg has to queue user queries, keep trying until goes through
  while (statusCode === 202) {
    ({ BGGGames, statusCode } = await getBGGGames(username));
  }

  if (BGGGames.length === 0) {
    return {isError: true, errorMsg: "Error fetching collection from BGG", detailedGames: []};
  }

  //extract ids
  const gameIds = getGameIds(BGGGames, false);

  //query bgg for more info on each game
  detailedGames = await getSpecificGamesDetailed(gameIds);

  if (detailedGames.length === 0) {
    return {isError: true, errorMsg: "Error fetching detailed games from BGG, check chunk size in server calls", detailedGames: []};
  }

  //clean up the data
  detailedGames.map((game) => {
    game.attributes = extractGameAttributes(game);
    removeLinks(game);
    return game;
  });

  return {isError: false, errorMsg: "", detailedGames};
}

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
  try {
    let payload = {
      username,
    };
    let res = await axios.get("http://localhost:3001/user-games", {
      params: payload,
    });
    let BGGGames = res?.data?.items?.item;
    let statusCode = res.status;
    return { BGGGames, statusCode };
  } catch (err) {
    console.log(err);
    return { BGGGames: [], statusCode: 500 };
  }
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
  setRefreshSessions
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

    setRefresh(!refresh);
    setRefreshSessions(!refreshSessions)
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
  setSnackbarError
) => {
  let payload = {
    params: {
      sessionId,
    },
  };
  try {
    await axios.delete("http://localhost:3001/session", payload);
    setRefreshSessions(!refreshSessions);
    setSnackbarSuccess(true)
    return;
  } catch (err) {
    console.log(err);
    setSnackbarError(true)
    return;
  }
};

export {
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
  getFriendsGames
};
