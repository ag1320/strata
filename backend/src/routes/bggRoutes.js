const { Router } = require("express");
const {
  getHotGames,
  getSpecificGames,
  getUserGames,
  getUserWishlist,
  getFriends,
} = require("../controllers/bggController");

const router = Router();

router.get("/hot-games", (req, res) => {
  getHotGames()
    .then((result) => res.status(200).send(result))
    .catch((error) => {
      console.error("Error fetching data from BGG:", error);
      res.status(500).send("Error fetching data from BGG");
    });
});

router.get("/specific-games", (req, res) => {
  const { gameIds } = req.query;
  getSpecificGames(gameIds)
    .then((result) => res.status(200).send(result))
    .catch((error) => {
      console.error("Error fetching data from BGG:", error);
      res.status(500).send("Error fetching data from BGG");
    });
});

router.get("/user-games", (req, res) => {
  const { username } = req.query;
  getUserGames(username)
    .then(({ pending, data }) => {
      if (pending) {
        res.status(202).send("Waiting for response");
      } else {
        res.status(200).send(data);
      }
    })
    .catch((error) => {
      console.error("STATUS:", error.response?.status);
      console.error("HEADERS:", error.response?.headers);
      console.error("DATA:", error.response?.data);
      res.status(500).send("Error fetching data from BGG");
    });
});

router.get("/user-wishlist", (req, res) => {
  const { username } = req.query;
  getUserWishlist(username)
    .then(({ pending, data }) => {
      if (pending) {
        res.status(202).send("Waiting for response");
      } else {
        res.status(200).send(data);
      }
    })
    .catch((error) => {
      console.error("Error fetching data from BGG:", error);
      res.status(500).send("Error fetching data from BGG");
    });
});

router.get("/friends", (req, res) => {
  const { username } = req.query;
  getFriends(username)
    .then(({ pending, data }) => {
      if (pending) {
        res.status(202).send("Waiting for response");
      } else {
        res.status(200).send(data);
      }
    })
    .catch((error) => {
      console.error("Error fetching data from BGG:", error);
      res.status(500).send("Error fetching data from BGG");
    });
});

module.exports = router;
