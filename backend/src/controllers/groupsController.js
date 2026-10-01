const knex = require("./dbConnection");

function postGroup(groupName) {
  return knex("groups").insert({ name: groupName });
}

function getGroups() {
  return knex("groups")
    .select("*")
    .then((data) => data)
    .catch((err) => err);
}

function deleteGroup(id) {
  return knex("groups").delete().where({ id });
}

function patchGroup(id, name) {
  return knex("groups").update({ name }).where({ id });
}

function postGamesGroups(game_id, group_id) {
  return knex("my_games_groups").insert({ game_id, group_id });
}

function deleteGamesGroups(group_id, game_id) {
  return knex("my_games_groups").delete().where({ group_id, game_id });
}

module.exports = {
  postGroup,
  getGroups,
  deleteGroup,
  patchGroup,
  postGamesGroups,
  deleteGamesGroups,
};
