const { Router } = require("express");
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
} = require("../controllers/gamesController");
const { sendError } = require("../utils/sendError");

const router = Router();

router.get("/db-my-games", (req, res) => {
  getMyGamesDb()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((error) => {
      sendError(res, error, 400);
    });
});

router.post("/db-my-games", (req, res) => {
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

router.patch("/db-my-games-rank", async (req, res) => {
  const { games } = req.body;

  try {
    await batchUpdateGameRanks(games);
    return res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to update game ranks");
  }
});

router.patch("/db-my-games-favorite", async (req, res) => {
  const { game, favorite } = req.body;

  try {
    await patchGameFavorite(game, favorite);
    return res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to update game favorite");
  }
});

module.exports = router;
