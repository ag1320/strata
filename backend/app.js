//npm install express pg knex morgan cors axios xml2js
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const axios = require("axios");
const xml2js = require("xml2js");

const {
  postGame,
  postGameAccessory,
  postGameArtist,
  postGameCategory,
  postGameCompilation,
  postGameDesigner,
  postGameExpansion,
  postGameFamily,
  postGameImplementation,
  postGameMechanic,
  postGamePublisher,
  getMyGamesDb,
  batchUpdateGameRanks,
  patchGameFavorite,
  getDifference,
  deleteGame,
  postGroup,
  getGroups,
  deleteGroup,
  patchGroup,
  postGamesGroups,
  deleteGamesGroups,
  getPlayers,
  postPlayer,
  postSession,
  postSessionPlayers,
  getSessions,
  deleteSession,
  patchPlayer
} = require("./controllers/controllers");

//****************************
//        SERVER SETUP
//****************************
const parser = new xml2js.Parser();
app.use(
  cors({
    origin: "*",
    methods: "GET, PUT, POST, PATCH, DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.use((req, res, next) => {
  req.headers["content-length"] &&
    console.log(
      `Incoming request body size: ${req.headers["content-length"]} bytes`
    );
  next();
});
const proxyUrl = "http://cors-anywhere-server:8080/";
const headers = {
  headers: {
    Origin: "http://localhost:3000",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
};

//****************************
//            BGG
//****************************
app.get("/hot-games", (req, res) => {
  const bggUrl = "https://www.boardgamegeek.com/xmlapi2/hot?boardgame";

  axios
    .get(proxyUrl + bggUrl, headers)
    .then((response) => {
      parser.parseString(response.data, (err, result) => {
        if (err) {
          console.error("Error parsing XML:", err);
          res.status(500).send(err);
        } else {
          res.status(200).send(result);
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching data from BGG:", error);
      res.status(500).send("Error fetching data from BGG");
    });
});

app.get("/specific-games", (req, res) => {
  let { gameIds } = req.query;
  let gameIdsString = gameIds.join(",");
  let bggUrl = "https://www.boardgamegeek.com/xmlapi2/thing?id=";
  bggUrl = bggUrl + gameIdsString;
  console.log("bggUrL", bggUrl);

  axios
    .get(proxyUrl + bggUrl, headers)
    .then((response) => {
      parser.parseString(response.data, (err, result) => {
        if (err) {
          console.error("Error parsing XML:", err);
          res.status(500).send(err);
        } else {
          res.status(200).send(result);
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching data from BGG:", error);
      res.status(500).send("Error fetching data from BGG");
    });
});

app.get("/user-games", (req, res) => {
  let { username } = req.query;
  let bggUrl = "https://www.boardgamegeek.com/xmlapi2/collection?username=";
  bggUrl = bggUrl + username;
  bggUrl = bggUrl + "&subtype=boardgame&own=1";

  axios
    .get(proxyUrl + bggUrl, headers)
    .then((response) => {
      if (response.status === 202) {
        res.status(202).send("Waiting for response");
      } else if (response.status === 200) {
        parser.parseString(response.data, (err, result) => {
          if (err) {
            console.error("Error parsing XML:", err);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }
        });
      } else {
        console.error("Unexpected status code from BGG:", response.status);
        res.status(500).send("Unexpected status code from BGG");
      }
    })
    .catch((error) => {
      console.error("Error fetching data from BGG:", error);
      res.status(500).send("Error fetching data from BGG");
    });
});

app.get("/friends", (req, res) => {
  let { username } = req.query;
  //https://www.boardgamegeek.com/xmlapi2/user?name=ag1320&buddies=1
  let bggUrl = "https://www.boardgamegeek.com/xmlapi2/user?name=";
  bggUrl = bggUrl + username;
  bggUrl = bggUrl + "&buddies=1";

  axios
    .get(proxyUrl + bggUrl, headers)
    .then((response) => {
      if (response.status === 202) {
        res.status(202).send("Waiting for response");
      } else if (response.status === 200) {
        parser.parseString(response.data, (err, result) => {
          if (err) {
            console.error("Error parsing XML:", err);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }
        });
      } else {
        console.error("Unexpected status code from BGG:", response.status);
        res.status(500).send("Unexpected status code from BGG");
      }
    })
    .catch((error) => {
      console.error("Error fetching data from BGG:", error);
      res.status(500).send("Error fetching data from BGG");
    });
});

//*********************************
//              DATABASE
//*********************************

app.get("/db-my-games", (req, res) => {
  getMyGamesDb()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

app.post("/db-my-games", (req, res) => {
  let { games } = req.body;
  let gameIdsBGG = games.map((game) => parseInt(game.$.id));
  let promises = [];
  games.forEach((game) => {
    let id = game.$.id;
    game.url = "https://boardgamegeek.com/boardgame/" + id.toString();
    let promise = postGame(game);
    promises.push(promise);

    if (game?.attributes?.accessories?.length > 0) {
      game.attributes.accessories.forEach((accessory) => {
        promise = postGameAccessory(id, accessory);
        promises.push(promise);
      });
    }

    if (game?.attributes?.artists?.length > 0) {
      game.attributes.artists.forEach((artist) => {
        promise = postGameArtist(id, artist);
        promises.push(promise);
      });
    }

    if (game?.attributes?.categories?.length > 0) {
      game.attributes.categories.forEach((category) => {
        promise = postGameCategory(id, category);
        promises.push(promise);
      });
    }

    if (game?.attributes?.compilations?.length > 0) {
      game.attributes.compilations.forEach((compilation) => {
        promise = postGameCompilation(id, compilation);
        promises.push(promise);
      });
    }

    if (game?.attributes?.designers?.length > 0) {
      game.attributes.designers.forEach((designer) => {
        promise = postGameDesigner(id, designer);
        promises.push(promise);
      });
    }

    if (game?.attributes?.expansions?.length > 0) {
      game.attributes.expansions.forEach((expansion) => {
        promise = postGameExpansion(id, expansion);
        promises.push(promise);
      });
    }

    if (game?.attributes?.families?.length > 0) {
      game.attributes.families.forEach((family) => {
        promise = postGameFamily(id, family);
        promises.push(promise);
      });
    }

    if (game?.attributes?.implementations?.length > 0) {
      game.attributes.implementations.forEach((implementation) => {
        promise = postGameImplementation(id, implementation);
        promises.push(promise);
      });
    }

    if (game?.attributes?.mechanics?.length > 0) {
      game.attributes.mechanics.forEach((mechanic) => {
        promise = postGameMechanic(id, mechanic);
        promises.push(promise);
      });
    }

    if (game?.attributes?.publishers?.length > 0) {
      game.attributes.publishers.forEach((publisher) => {
        promise = postGamePublisher(id, publisher);
        promises.push(promise);
      });
    }
  });
  Promise.all(promises).then(() => {
    getMyGamesDb().then((data) => {
      let gameIdsDb = data.map((game) => parseInt(game.id));
      let dbIdsNotOnBGG = getDifference(gameIdsDb, gameIdsBGG);
      if (dbIdsNotOnBGG.length > 0) {
        dbIdsNotOnBGG.forEach((id) => {
          deleteGame(id).then(() => {
            res.status(200).send();
          });
        });
      } else {
        res.status(200).send();
      }
    });
  });
});

app.patch("/db-my-games-rank", async (req, res) => {
  const { games } = req.body;

  try {
    await batchUpdateGameRanks(games);
    return res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to update game ranks");
  }
});

app.patch("/db-my-games-favorite", async (req, res) => {
  const { game, favorite } = req.body;

  try {
    await patchGameFavorite(game, favorite);
    return res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to update game favorite");
  }
});

app.post("/db-groups", async (req, res) => {
  const { groupName } = req.body;

  try {
    await postGroup(groupName);
    return res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to add group");
  }
});

app.get("/db-groups", async (req, res) => {
  getGroups()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

app.delete("/db-groups", async (req, res) => {
  let { group } = req.query;
  let id = group.id;

  deleteGroup(id)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

app.patch("/db-groups", async (req, res) => {
  const { editId, groupName } = req.body;

  try {
    await patchGroup(editId, groupName);
    return res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to update group");
  }
});

app.post("/db-games-groups", async (req, res) => {
  const { gameId, groupId } = req.body;

  try {
    await postGamesGroups(gameId, groupId);
    return res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to add game/group");
  }
});

app.delete("/db-games-groups", async (req, res) => {
  let { groupId, gameId } = req.query;

  deleteGamesGroups(groupId, gameId)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

app.get("/db-players", async (req, res) => {
  getPlayers()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

app.post("/db-players", async (req, res) => {
  const { first_name, last_name } = req.body;
  try {
    await postPlayer(first_name, last_name).then((data) => {
      res.status(200).send(data);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to add player");
  }
});

app.patch("/db-players", async (req, res) => {
  const {
    id,
    top_three_games_by_num_plays,
    top_three_most_recent_games,
    games_with_highest_win_percentage,
    total_wins,
    win_percentage,
    total_plays,
  } = req.body;

  try {
    await patchPlayer(
      id,
      top_three_games_by_num_plays,
      top_three_most_recent_games,
      games_with_highest_win_percentage,
      total_wins,
      win_percentage,
      total_plays
    );
    return res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to update player");
  }
});

app.post("/session", async (req, res) => {
  const {
    selectedGame,
    gameType,
    coopDidWin,
    notes,
    selectedDate,
    //isHistoric,
    duration,
    winnerScore,
    activePlayers,
  } = req.body;

  try {
    const sessionId = await postSession(
      selectedGame,
      gameType,
      coopDidWin,
      notes,
      selectedDate,
      //isHistoric,
      duration,
      winnerScore,
      activePlayers
    );
    await postSessionPlayers(sessionId, activePlayers);

    res.status(200).send("Session added successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to add session");
  }
});

app.get("/session", async (req, res) => {
  getSessions()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

app.delete("/session", async (req, res) => {
  let { sessionId } = req.query;
  deleteSession(sessionId)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

const port = 3001;
app.listen(port, () =>
  console.log(`Backend listening at http://localhost:${port}`)
);
