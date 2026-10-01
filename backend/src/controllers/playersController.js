const knex = require("./dbConnection");

function getPlayers() {
  return knex("players")
    .select("*")
    .then((data) => data)
    .catch((err) => err);
}

async function getPlayersByIds(playerIds) {
  try {
    // Fetch players whose IDs are in the playerIds array
    const players = await knex("players")
      .whereIn("id", playerIds)
      .select("*");

    return players;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function postPlayer(first_name, last_name) {
  return knex("players").insert({ first_name, last_name }).returning("*");
}

async function doesPlayerHaveSessions(playerId) {
  try {
    // Query the sessions_players table to check if the player has any sessions
    const exists = await knex("sessions_players")
      .select("session_id")
      .where({ player_id: playerId })
      .first();

    return !!exists; // Return true if a session exists, false otherwise
  } catch (error) {
    console.error(`Error checking sessions for player with ID ${playerId}:`, error);
    throw error;
  }
}

function deletePlayer(id) {
  return knex("players").delete().where({ id });
}

async function patchPlayer(
  id,
  top_three_games_by_num_plays,
  top_three_most_recent_games,
  games_with_highest_win_percentage,
  total_wins,
  win_percentage,
  total_plays
) {
  return knex("players")
    .where({ id })
    .update({
      top_three_games_by_num_plays,
      top_three_most_recent_games,
      games_with_highest_win_percentage,
      total_wins,
      win_percentage,
      total_plays
    });
}

module.exports = {
  getPlayers,
  getPlayersByIds,
  postPlayer,
  doesPlayerHaveSessions,
  deletePlayer,
  patchPlayer,
};
