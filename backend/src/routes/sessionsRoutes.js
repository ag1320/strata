const { Router } = require("express");
const {
  postSession,
  postSessionPlayers,
  getSessions,
  deleteSession,
} = require("../controllers/sessionsController");
const {
  getPlayersByIds,
  doesPlayerHaveSessions,
  deletePlayer,
} = require("../controllers/playersController");

const router = Router();

router.post("/session", async (req, res) => {
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

router.get("/session", async (req, res) => {
  getSessions()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

router.delete("/session", async (req, res) => {
  let { sessionId } = req.query;
  try {
    const playerIds = await deleteSession(sessionId);

    for (const playerId of playerIds) {
      const hasSessions = await doesPlayerHaveSessions(playerId);
      if (!hasSessions) {
        await deletePlayer(playerId);
      }
    }

    const playerData = await getPlayersByIds(playerIds);
    res.status(200).send(playerData);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

module.exports = router;
