const knex = require("./dbConnection");

async function postSession(
  selectedGame,
  game_type,
  coop_did_win,
  notes,
  date,
  //is_historic,
  duration,
  winner_score,
  activePlayers
) {
  let game_id = selectedGame.id;
  if (duration === 0 || duration === "") duration = null;
  if (notes === "") notes = null;
  if (winner_score === 0 || winner_score === "") winner_score = null;
  let player_count = activePlayers.length;

  if (!(game_type === "cooperative" || game_type === "semi-cooperative")) {
    coop_did_win = null;
  }

  // Insert the new session and get the session ID
  const result = await knex("sessions")
    .insert({
      game_id,
      game_type,
      coop_did_win,
      notes,
      date,
      //is_historic,
      duration,
      winner_score,
      player_count,
    })
    .returning("id");

  const sessionId = result[0].id;
  return sessionId;
}

function postSessionPlayers(sessionId, activePlayers) {
  const sessionPlayers = activePlayers.map((player) => ({
    session_id: sessionId,
    player_id: player.id,
    is_winner: player.isWinner,
  }));

  return knex("sessions_players").insert(sessionPlayers);
}

async function getSessions() {
  try {
    const data = await knex("sessions")
      .join("sessions_players", "sessions.id", "sessions_players.session_id") // Join sessions and sessions_players
      .join("players", "sessions_players.player_id", "players.id") // Join sessions_players and players
      .select(
        "sessions.id AS session_id",
        "sessions.game_id",
        "sessions.game_type",
        "sessions.coop_did_win",
        "sessions.notes",
        "sessions.date",
        "sessions.is_historic",
        "sessions.duration",
        "sessions.winner_score",
        "sessions.player_count",
        "players.id AS player_id",
        "players.first_name",
        "players.last_name",
        "sessions_players.is_winner AS is_winner"
      );

    const sessions = [];
    data.forEach((row) => {
      let session = sessions.find(
        (session) => session.sessionId === row.session_id
      );
      if (!session) {
        session = {
          sessionId: row.session_id,
          gameId: row.game_id,
          gameType: row.game_type,
          coopDidWin: row.coop_did_win,
          notes: row.notes,
          date: row.date,
          isHistoric: row.is_historic,
          duration: row.duration,
          winnerScore: row.winner_score,
          playerCount: row.player_count,
          players: [],
        };
        sessions.push(session);
      }
      session.players.push({
        playerId: row.player_id,
        firstName: row.first_name,
        lastName: row.last_name,
        isWinner: row.is_winner,
      });
    });

    return sessions;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function deleteSession(id) {
  try {
    // Step 1: Fetch all player IDs associated with the session
    const players = await knex("sessions_players")
      .where({ session_id: id })
      .select("player_id");

    // Extract player IDs from the result
    const playerIds = players.map(player => player.player_id);

    // Step 2: Delete the session
    await knex("sessions")
      .delete()
      .where({ id });

    // Return the player IDs of the deleted session
    return playerIds;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = {
  postSession,
  postSessionPlayers,
  getSessions,
  deleteSession,
};
