const { Router } = require("express");
const {
  getPlayers,
  postPlayer,
  patchPlayer,
} = require("../controllers/playersController");
const { sendError } = require("../utils/sendError");

const router = Router();

router.get("/db-players", async (req, res) => {
  getPlayers()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((error) => {
      sendError(res, error, 400);
    });
});

router.post("/db-players", async (req, res) => {
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

router.patch("/db-players", async (req, res) => {
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

module.exports = router;
