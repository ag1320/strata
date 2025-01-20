const extractGameAttributes = (game) => {
  /*This function takes in a game and returns an object of arrays of objects.
  The output is of the format:
  {
    categories
    mechanics
    family
    expansions
    accesories
    compilations
    implementations
    designers
    artists
    publishers (array)
      [
        publisher1
        publisher2
        publisher3 (object) 
        {
          value: "XXXX"
          id: 123
        }
      ]
  }
  */

  //guard
  if (!game.link || game.link.length === 0) {
    console.log("game has no attributes");
    return;
  }

  //intialize
  let links = game.link;
  let categories = [];
  let mechanics = [];
  let families = [];
  let expansions = [];
  let accessories = [];
  let compilations = [];
  let implementations = [];
  let designers = [];
  let artists = [];
  let publishers = [];

  //extract
  links.forEach((link) => {
    let type = link.$.type;
    let value = link.$.value;
    let id = link.$.id;
    let obj = {
      value,
      id,
    };
    switch (type) {
      case "boardgamecategory":
        categories.push(obj);
        break;
      case "boardgamemechanic":
        mechanics.push(obj);
        break;
      case "boardgamefamily":
        families.push(obj);
        break;
      case "boardgameexpansion":
        expansions.push(obj);
        break;
      case "boardgameaccessory":
        accessories.push(obj);
        break;
      case "boardgamecompilation":
        compilations.push(obj);
        break;
      case "boardgameimplementation":
        implementations.push(obj);
        break;
      case "boardgamedesigner":
        designers.push(obj);
        break;
      case "boardgameartist":
        artists.push(obj);
        break;
      case "boardgamepublisher":
        publishers.push(obj);
        break;
      default:
        break;
    }
  });

  let outputObj = {
    categories,
    mechanics,
    families,
    expansions,
    accessories,
    compilations,
    implementations,
    designers,
    artists,
    publishers,
  };

  return outputObj;
};

const removeLinks = (game) => {
  delete game.link;
};

function getFirstFiveIds(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return [];
  }

  return arr.slice(0, 5).map((item) => item.$.id);
}

function getGameIds(arr, isHotGames) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return [];
  }

  if (isHotGames) {
    return arr.map((item) => {
      console.log("item id", item.$.id);
      return item.$.id;
    });
  } else {
    return arr.map((item) => item.$.objectid);
  }
}

function makeUniqueFilterChips(attributeFilterChips) {
  const uniqueObjects = [];
  const uniqueKeys = new Set();

  attributeFilterChips.forEach((obj) => {
    const key = obj.type + obj.id + obj.name;
    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key);
      uniqueObjects.push(obj);
    }
  });

  return uniqueObjects;
}

function filterGamesByAttributes(games, attributeFilterChips, isAnd) {
  if (!attributeFilterChips || attributeFilterChips.length === 0) {
    return games;
  }

  return games.filter((game) => {
    if (!isAnd) {
      // OR logic: At least one attribute must match
      return attributeFilterChips.some((filterChip) => {
        return (
          game.attributes.categories.some(
            (attr) => attr.id === filterChip.id && attr.type === filterChip.type
          ) ||
          game.attributes.mechanics.some(
            (attr) => attr.id === filterChip.id && attr.type === filterChip.type
          ) ||
          game.attributes.artists.some(
            (attr) => attr.id === filterChip.id && attr.type === filterChip.type
          ) ||
          game.attributes.designers.some(
            (attr) => attr.id === filterChip.id && attr.type === filterChip.type
          ) ||
          game.attributes.publishers.some(
            (attr) => attr.id === filterChip.id && attr.type === filterChip.type
          )
        );
      });
    } else {
      // AND logic: All attributes must match
      return attributeFilterChips.every((filterChip) => {
        return (
          game.attributes.categories.some(
            (attr) => attr.id === filterChip.id && attr.type === filterChip.type
          ) ||
          game.attributes.mechanics.some(
            (attr) => attr.id === filterChip.id && attr.type === filterChip.type
          ) ||
          game.attributes.artists.some(
            (attr) => attr.id === filterChip.id && attr.type === filterChip.type
          ) ||
          game.attributes.designers.some(
            (attr) => attr.id === filterChip.id && attr.type === filterChip.type
          ) ||
          game.attributes.publishers.some(
            (attr) => attr.id === filterChip.id && attr.type === filterChip.type
          )
        );
      });
    }
  });
}

// Function to filter games by search query
const filterGamesBySearch = (myGames, searchQuery) => {
  if (!searchQuery.trim()) {
    return myGames; // Return all games if search query is empty
  } else {
    const filtered = myGames.filter((game) => {
      const matchCategories = game.attributes.categories.some((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchMechanics = game.attributes.mechanics.some((mechanic) =>
        mechanic.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchArtists = game.attributes.artists.some((artist) =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchDesigners = game.attributes.designers.some((designer) =>
        designer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchPublishers = game.attributes.publishers.some((publisher) =>
        publisher.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        matchCategories ||
        matchMechanics ||
        matchArtists ||
        matchDesigners ||
        matchPublishers
      );
    });

    return filtered;
  }
};

const filterGamesByExpansion = (filteredGames, type) => {
  if (type === "expansions")
    return filteredGames.filter((game) => game.type === "boardgameexpansion");
  else if (type === "boardgames")
    return filteredGames.filter((game) => game.type === "boardgame");
};

const filterGamesByPlayers = (filteredGames, playersFilter) => {
  const [minPlayers, maxPlayers] = playersFilter.range;

  if (playersFilter.isExactMatchChecked) {
    return filteredGames.filter((game) => {
      return (
        parseInt(game.min_players) === minPlayers &&
        parseInt(game.max_players) === maxPlayers
      );
    });
  } else {
    return filteredGames.filter((game) => {
      return game.min_players <= minPlayers && game.max_players >= maxPlayers;
    });
  }
};

const filterGamesByTime = (filteredGames, timeRange) => {
  const [minTime, maxTime] = timeRange;
  if (minTime === maxTime) {
    return filteredGames.filter((game) => {
      return parseInt(game.playingtime) === minTime;
    });
  } else {
    return filteredGames.filter((game) => {
      return (
        parseInt(game.playingtime) >= minTime &&
        parseInt(game.playingtime) <= maxTime
      );
    });
  }
};

const sortGames = (filteredGames, sort, isAscending) => {
  let sortedGames = filteredGames;
  if (sort === "rank") {
    sortedGames = filteredGames.sort((a, b) => a.rank - b.rank);
  }

  if (sort === "playingTime") {
    sortedGames = filteredGames.sort(
      (a, b) => parseInt(a.playingtime) - parseInt(b.playingtime)
    );
  }

  if (sort === "minPlayers") {
    sortedGames = filteredGames.sort(
      (a, b) => parseInt(a.min_players) - parseInt(b.min_players)
    );
  }

  if (sort === "maxPlayers") {
    sortedGames = filteredGames.sort(
      (a, b) => parseInt(a.max_players) - parseInt(b.max_players)
    );
  }

  if (!isAscending) {
    sortedGames = sortedGames.reverse();
  }

  return sortedGames;
};

const filterGamesByFavorite = (filteredGames) => {
  return filteredGames.filter((game) => game.isFavorite);
};

const filterGamesByGroups = (filteredGames, filterGroups, isAnd) => {
  if (!filterGroups.length) return filteredGames;

  const groupIds = filterGroups.map((group) => group.id);

  return filteredGames.filter((game) => {
    const gameGroupIds = game.attributes.groups.map((group) => group.id);

    if (isAnd) {
      // AND logic: All filterGroups must be present in the game's groups
      return groupIds.every((id) => gameGroupIds.includes(id));
    } else {
      // OR logic: At least one filterGroup must be present in the game's groups
      return groupIds.some((id) => gameGroupIds.includes(id));
    }
  });
};

const filterGameOptions = (myGames, filteredGames) => {
  const filteredGameIds = new Set(filteredGames.map((game) => game.id));
  const filteredGamesOptions = myGames.filter(
    (game) => !filteredGameIds.has(game.id)
  );

  return filteredGamesOptions;
};

//get single random game based on filters
const getRandomGame = (games) => {
  const numGames = games.length; // Get the total number of games
  const randomIndex = Math.floor(Math.random() * numGames); // Generate a random index
  return [games[randomIndex]]; // Return the game at the random index
};

// filterGames.js
const filterGames = ({
  myGames,
  attributeFilterChips,
  isAnd,
  generalFilters,
  favoriteFilter,
  sort,
  isAscending,
  debouncedQuery,
}) => {
  let filteredGames = [...myGames];

  // Apply attribute filter
  if (attributeFilterChips.length > 0) {
    filteredGames = filterGamesByAttributes(
      filteredGames,
      attributeFilterChips,
      isAnd
    );
  }

  // Apply expansion filter
  if (generalFilters.type !== "both") {
    filteredGames = filterGamesByExpansion(filteredGames, generalFilters.type);
  }

  // Apply players filter
  if (generalFilters.players.isUsed) {
    filteredGames = filterGamesByPlayers(filteredGames, generalFilters.players);
  }

  // Apply time filter
  if (generalFilters.time.isUsed) {
    filteredGames = filterGamesByTime(filteredGames, generalFilters.time.range);
  }

  // Apply favorite filter
  if (favoriteFilter) {
    filteredGames = filterGamesByFavorite(filteredGames);
  }

  // Apply group filter
  if (generalFilters.filterGroups.groups.length > 0) {
    filteredGames = filterGamesByGroups(
      filteredGames,
      generalFilters.filterGroups.groups,
      generalFilters.filterGroups.isAnd
    );
  }

  //apply search
  if (debouncedQuery !== "") {
    filteredGames = filterGamesBySearch(myGames, debouncedQuery);
  }

  // Apply sorting
  filteredGames = sortGames(filteredGames, sort, isAscending);

  // Apply random game selection
  if (generalFilters.getRandom) {
    filteredGames = getRandomGame(filteredGames);
  }

  return filteredGames;
};

const sanitizeFriendsData = (dirtyFriends) => {
  let sanitizedFriends = [];

  dirtyFriends.forEach((friend) => {
    let friendObj = {};
    friendObj.name = friend.buddy[0].$.name;
    friendObj.id = friend.buddy[0].$.id;
    sanitizedFriends.push(friendObj);
  });

  return sanitizedFriends;
};

//***************SANITIZE SESSION FOR STATS PAGES******************
//SETUP
//Sanitize the session data - group session by id,
//then attach the game obj to each session
const groupSessions = (sessionData) =>{
  const groupedSessions = sessionData.reduce((acc, session) => {
    if (!acc[session.sessionId]) {
      // If this sessionId is not already in the accumulator, initialize it
      acc[session.sessionId] = { ...session, players: [...session.players] };
    } else {
      // If this sessionId is already in the accumulator, merge the players arrays
      acc[session.sessionId].players = [
        ...acc[session.sessionId].players,
        ...session.players,
      ];
    }
    return acc;
  }, {});

  const uniqueSessions = Object.values(groupedSessions);
  return uniqueSessions
}

const addGameToSessions = (uniqueSessions, myGames) => {
  const gameById = myGames.reduce((acc, game) => {
    acc[game.id] = game;
    return acc;
  }, {});

  uniqueSessions.forEach((session) => {
    session.game = gameById[session.gameId];
  });
};
//END SETUP

// MOST PLAYED
// Get the frequency of each game
const getMostPlayed = (uniqueSessions, myGames) =>{
  const gameFrequency = uniqueSessions.reduce((acc, session) => {
    acc[session.gameId] = (acc[session.gameId] || 0) + 1;
    return acc;
  }, {});

  // Sort the games by the number of total plays
  const sortedGamesByNumPlays = myGames
    .map((game) => ({
      ...game,
      totalPlays: gameFrequency[game.id] || 0,
    }))
    .sort((a, b) => b.totalPlays - a.totalPlays);

  // Find the most played game(s)
  const maxPlays = sortedGamesByNumPlays[0]?.totalPlays || 0;
  const mostPlayedGames = sortedGamesByNumPlays.filter(
    (game) => game.totalPlays === maxPlays
  );
  return {mostPlayedGames, sortedGamesByNumPlays}
}
// END MOST PLAYED

// MOST RECENT PLAYS
const getMostRecent= (uniqueSessions, myGames) =>{
  const gameDates = uniqueSessions.reduce((acc, session) => {
    const game = session.game; // Already attached to session
    if (game) {
      acc[game.id] = acc[game.id] || [];
      acc[game.id].push(session.date);
    }
    return acc;
  }, {});

 
  
  const sortedGamesByDate = myGames
    .map((game) => {
      const dates = gameDates[game.id] || [];
      const mostRecentDate = dates.length
        ? new Date(Math.max(...dates.map((date) => new Date(date))))
        : null;
      return {
        ...game,
        mostRecentDate,
      };
    })
    .sort((a, b) => b.mostRecentDate - a.mostRecentDate);
  
  const mostRecentlyPlayedGames = sortedGamesByDate.filter((game) => {
    const mostRecentPlayTimestamp =
      sortedGamesByDate[0]?.mostRecentDate.getTime();
    const gameTimestamp = game.mostRecentDate?.getTime();
    return (
      Math.floor(gameTimestamp / (1000 * 60 * 60 * 24)) ===
      Math.floor(mostRecentPlayTimestamp / (1000 * 60 * 60 * 24))
    );
  });
  return {mostRecentlyPlayedGames, sortedGamesByDate}
}
// END MOST RECENT PLAYS
//***************END SANITIZE SESSION FOR STATS PAGES******************


const sanitizeSessions = (sessionData, myGames) => {
  const uniqueSessions = groupSessions(sessionData)
  addGameToSessions(uniqueSessions, myGames);
  const {mostPlayedGames, sortedGamesByNumPlays} = getMostPlayed(uniqueSessions, myGames)
  const {mostRecentlyPlayedGames, sortedGamesByDate} = getMostRecent(uniqueSessions, myGames)
  return {uniqueSessions, mostPlayedGames, sortedGamesByNumPlays, mostRecentlyPlayedGames, sortedGamesByDate}
};

const calculateWinPercentage = (filteredSessions, selectedPlayer) => {
  if (!selectedPlayer || filteredSessions.length === 0) {
    return 0;
  }

  const totalGames = filteredSessions.length;

  const totalWins = filteredSessions.reduce((wins, session) => {
    const playerInSession = session.players.find(
      (player) => player.playerId === selectedPlayer.id
    );
    return playerInSession?.isWinner ? wins + 1 : wins;
  }, 0);

  const winPercentage = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  return {totalGames, totalWins, winPercentage}
};


const findGamesWithHighestWinPercentage = (filteredSessions, selectedPlayer) => {
  // Calculate win percentage for each game
  const gameStats = filteredSessions.reduce((acc, session) => {
    const { game, players } = session;
    const playerData = players.find(player => player.playerId === selectedPlayer.id);

    if (playerData) {
      // Initialize game stats if not already present
      if (!acc[game.name]) {
        acc[game.name] = { wins: 0, totalPlays: 0 };
      }

      // Update win stats for the selected player
      acc[game.name].totalPlays += 1;
      if (playerData.isWinner) {
        acc[game.name].wins += 1;
      }
    }

    return acc;
  }, {});


  // Calculate win percentage and find the game(s) with the highest win percentage
  const gameWinPercentages = Object.keys(gameStats).map(name => {
    const { wins, totalPlays } = gameStats[name];
    const winPercentage = Number((totalPlays > 0 ? (wins / totalPlays) * 100 : 0).toFixed(0));
    return { name, winPercentage };
  });

  // Find the maximum win percentage
  const maxWinPercentage = Math.max(...gameWinPercentages.map(game => game.winPercentage));

  // Filter games that have the highest win percentage
  console.log("maxWiPercentage", maxWinPercentage)
  console.log("gameWinPercentages", gameWinPercentages)

  if (maxWinPercentage === 0){
    return []
  }
  return gameWinPercentages.filter(game => game.winPercentage === maxWinPercentage);
};





export {
  extractGameAttributes,
  removeLinks,
  getFirstFiveIds,
  getGameIds,
  filterGamesByAttributes,
  makeUniqueFilterChips,
  filterGamesBySearch,
  filterGamesByExpansion,
  filterGamesByPlayers,
  filterGamesByTime,
  sortGames,
  filterGamesByFavorite,
  filterGamesByGroups,
  filterGameOptions,
  filterGames,
  sanitizeFriendsData,
  getMostPlayed,
  getMostRecent,
  sanitizeSessions,
  calculateWinPercentage,
  findGamesWithHighestWinPercentage
};

// function getAttributes(obj, keyword) {
//   let attributes = obj[keyword]
//   let result = []
//   attributes.forEach((attribute)=>{
//     result.push(attribute.name)
//   })
//   return result
// }
