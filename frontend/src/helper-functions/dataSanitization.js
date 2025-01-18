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
  debouncedQuery
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

const sanitizeFriendsData = (dirtyFriends) =>{
  let sanitizedFriends = [];
  
  dirtyFriends.forEach((friend)=>{
    let friendObj = {}
    friendObj.name = friend.buddy[0].$.name
    friendObj.id = friend.buddy[0].$.id
    sanitizedFriends.push(friendObj)
  })

  return sanitizedFriends
}

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
  sanitizeFriendsData
};

// function getAttributes(obj, keyword) {
//   let attributes = obj[keyword]
//   let result = []
//   attributes.forEach((attribute)=>{
//     result.push(attribute.name)
//   })
//   return result
// }
