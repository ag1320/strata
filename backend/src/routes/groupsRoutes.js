const { Router } = require("express");
const {
  postGroup,
  getGroups,
  deleteGroup,
  patchGroup,
  postGamesGroups,
  deleteGamesGroups,
} = require("../controllers/groupsController");
const { sendError } = require("../utils/sendError");

const router = Router();

router.post("/db-groups", async (req, res) => {
  const { groupName } = req.body;

  try {
    await postGroup(groupName);
    return res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to add group");
  }
});

router.get("/db-groups", async (req, res) => {
  getGroups()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((error) => {
      sendError(res, error, 400);
    });
});

router.delete("/db-groups", async (req, res) => {
  let { group } = req.query;
  let id = group.id;

  deleteGroup(id)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      sendError(res, error, 400);
    });
});

router.patch("/db-groups", async (req, res) => {
  const { editId, groupName } = req.body;

  try {
    await patchGroup(editId, groupName);
    return res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to update group");
  }
});

router.post("/db-games-groups", async (req, res) => {
  const { gameId, groupId } = req.body;

  try {
    await postGamesGroups(gameId, groupId);
    return res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to add game/group");
  }
});

router.delete("/db-games-groups", async (req, res) => {
  let { groupId, gameId } = req.query;

  deleteGamesGroups(groupId, gameId)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      sendError(res, error, 400);
    });
});

module.exports = router;
