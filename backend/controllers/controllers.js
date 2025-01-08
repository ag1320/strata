const knex = require("./dbConnection");
const axios = require("axios").default;
const fs = require("fs");

async function getGameArtists() {
  const artists = await knex("my_games")
    .select(
      "my_games.id as game_id",
      "artists.id as artist_id",
      "artists.name as artist_name"
    )
    .leftJoin("my_games_artists", "my_games.id", "my_games_artists.game_id")
    .leftJoin("artists", "my_games_artists.artist_id", "artists.id");

  return groupAttributesByGame(artists, "artist_id", "artist_name", "artists");
}

async function getGameCategories() {
  const categories = await knex("my_games")
    .select(
      "my_games.id as game_id",
      "categories.id as category_id",
      "categories.name as category_name"
    )
    .leftJoin(
      "my_games_categories",
      "my_games.id",
      "my_games_categories.game_id"
    )
    .leftJoin("categories", "my_games_categories.category_id", "categories.id");

  return groupAttributesByGame(
    categories,
    "category_id",
    "category_name",
    "categories"
  );
}

async function getGameDesigners() {
  const designers = await knex("my_games")
    .select(
      "my_games.id as game_id",
      "designers.id as designer_id",
      "designers.name as designer_name"
    )
    .leftJoin("my_games_designers", "my_games.id", "my_games_designers.game_id")
    .leftJoin("designers", "my_games_designers.designer_id", "designers.id");

  return groupAttributesByGame(
    designers,
    "designer_id",
    "designer_name",
    "designers"
  );
}

async function getGameExpansions() {
  const expansions = await knex("my_games")
    .select(
      "my_games.id as game_id",
      "expansions.id as expansion_id",
      "expansions.name as expansion_name"
    )
    .leftJoin(
      "my_games_expansions",
      "my_games.id",
      "my_games_expansions.game_id"
    )
    .leftJoin(
      "expansions",
      "my_games_expansions.expansion_id",
      "expansions.id"
    );

  return groupAttributesByGame(
    expansions,
    "expansion_id",
    "expansion_name",
    "expansions"
  );
}

async function getGameFamilies() {
  const families = await knex("my_games")
    .select(
      "my_games.id as game_id",
      "families.id as family_id",
      "families.name as family_name"
    )
    .leftJoin("my_games_families", "my_games.id", "my_games_families.game_id")
    .leftJoin("families", "my_games_families.family_id", "families.id");

  return groupAttributesByGame(
    families,
    "family_id",
    "family_name",
    "families"
  );
}

async function getGameMechanics() {
  const mechanics = await knex("my_games")
    .select(
      "my_games.id as game_id",
      "mechanics.id as mechanic_id",
      "mechanics.name as mechanic_name"
    )
    .leftJoin("my_games_mechanics", "my_games.id", "my_games_mechanics.game_id")
    .leftJoin("mechanics", "my_games_mechanics.mechanic_id", "mechanics.id");

  return groupAttributesByGame(
    mechanics,
    "mechanic_id",
    "mechanic_name",
    "mechanics"
  );
}

async function getGamePublishers() {
  const publishers = await knex("my_games")
    .select(
      "my_games.id as game_id",
      "publishers.id as publisher_id",
      "publishers.name as publisher_name"
    )
    .leftJoin(
      "my_games_publishers",
      "my_games.id",
      "my_games_publishers.game_id"
    )
    .leftJoin(
      "publishers",
      "my_games_publishers.publisher_id",
      "publishers.id"
    );

  return groupAttributesByGame(
    publishers,
    "publisher_id",
    "publisher_name",
    "publishers"
  );
}

async function getGameGroups() {
  const groups = await knex("my_games")
    .select(
      "my_games.id as game_id",
      "groups.id as group_id",
      "groups.name as group_name"
    )
    .leftJoin("my_games_groups", "my_games.id", "my_games_groups.game_id")
    .leftJoin("groups", "my_games_groups.group_id", "groups.id");

  return groupAttributesByGame(groups, "group_id", "group_name", "groups");
}

function toSingular(plural) {
  if (plural.endsWith("ies")) {
    return plural.slice(0, -3) + "y";
  } else if (plural.endsWith("ves")) {
    return plural.slice(0, -3) + "f";
  } else if (plural.endsWith("s")) {
    return plural.slice(0, -1);
  }
  return plural;
}

function groupAttributesByGame(data, attrId, attrName, attrKey) {
  return data.reduce((acc, item) => {
    const { game_id, [attrId]: id, [attrName]: name } = item;

    if (!acc[game_id]) {
      acc[game_id] = {
        id: game_id,
        [attrKey]: [],
      };
    }

    if (id) {
      acc[game_id][attrKey].push({ id, name, type: toSingular(attrKey) });
    }

    return acc;
  }, {});
}

async function getMyGamesDb() {
  try {
    const games = await knex("my_games").select("*");
    const artists = await getGameArtists();
    const categories = await getGameCategories();
    const designers = await getGameDesigners();
    const expansions = await getGameExpansions();
    const families = await getGameFamilies();
    const mechanics = await getGameMechanics();
    const publishers = await getGamePublishers();
    const groups = await getGameGroups();

    const combinedData = games.map((game) => {
      const game_id = game.id;
      return {
        ...game,
        attributes: {
          artists: artists[game_id]?.artists || [],
          categories: categories[game_id]?.categories || [],
          designers: designers[game_id]?.designers || [],
          expansions: expansions[game_id]?.expansions || [],
          families: families[game_id]?.families || [],
          mechanics: mechanics[game_id]?.mechanics || [],
          publishers: publishers[game_id]?.publishers || [],
          groups: groups[game_id]?.groups || [],
        },
      };
    });

    return combinedData;
  } catch (error) {
    console.error("Error fetching games", error);
  }
}

function postGame(game) {
  let id = game.$.id;
  let name = game?.name?.[0]?.$?.value ? game.name[0].$.value : "";
  let year_published = game?.yearpublished?.[0]?.$?.value
    ? game.yearpublished[0].$.value
    : "";
  let type = game.$?.type ? game.$.type : "";
  let description = game?.description?.[0] ? game.description[0] : "";
  let image = "";
  if (game?.image?.[0]) image = game.image[0];
  else if (game?.thumbnail?.[0]) image = game.thumbnail[0];
  let thumbnail = "";
  if (game?.thumbnail?.[0]) thumbnail = game.thumbnail[0];
  else if (game?.image?.[0]) thumbnail = game.image[0];
  let max_players = game?.maxplayers?.[0]?.$?.value
    ? game?.maxplayers?.[0]?.$?.value
    : "";
  let min_players = game?.minplayers?.[0]?.$?.value
    ? game?.minplayers?.[0]?.$?.value
    : "";
  let max_playtime = game?.maxplaytime?.[0]?.$?.value
    ? game?.maxplaytime?.[0]?.$?.value
    : "";
  let min_playtime = game?.minplaytime?.[0]?.$?.value
    ? game?.minplaytime?.[0]?.$?.value
    : "";
  let playingtime = game?.playingtime?.[0]?.$?.value
    ? game?.playingtime?.[0]?.$?.value
    : "";
  let min_age = game?.minage?.[0]?.$?.value ? game?.minage?.[0]?.$?.value : "";
  let url = game.url;

  return knex("my_games")
    .insert({
      id,
      name,
      year_published,
      type,
      description,
      image,
      thumbnail,
      max_players,
      min_players,
      max_playtime,
      min_playtime,
      playingtime,
      min_age,
      url,
    })
    .onConflict("id")
    .ignore();
}

function postGameAccessory(game_id, accessory) {
  let id = accessory.id;
  let name = accessory.value;

  return knex("accessories")
    .insert({
      id,
      name,
    })
    .onConflict("id")
    .ignore()
    .then(() => {
      return knex("my_games_accessories")
        .insert({
          game_id,
          accessory_id: id,
        })
        .onConflict(["game_id", "accessory_id"])
        .ignore();
    });
}

function postGameArtist(game_id, artist) {
  let id = artist.id;
  let name = artist.value;

  return knex("artists")
    .insert({
      id,
      name,
    })
    .onConflict("id")
    .ignore()
    .then(() => {
      return knex("my_games_artists")
        .insert({
          game_id,
          artist_id: id,
        })
        .onConflict(["game_id", "artist_id"])
        .ignore();
    });
}

function postGameCategory(game_id, category) {
  let id = category.id;
  let name = category.value;

  return knex("categories")
    .insert({
      id,
      name,
    })
    .onConflict("id")
    .ignore()
    .then(() => {
      return knex("my_games_categories")
        .insert({
          game_id,
          category_id: id,
        })
        .onConflict(["game_id", "category_id"])
        .ignore();
    });
}

function postGameCompilation(game_id, compilation) {
  let id = compilation.id;
  let name = compilation.value;

  return knex("compilations")
    .insert({
      id,
      name,
    })
    .onConflict("id")
    .ignore()
    .then(() => {
      return knex("my_games_compilations")
        .insert({
          game_id,
          compilation_id: id,
        })
        .onConflict(["game_id", "compilation_id"])
        .ignore();
    });
}

function postGameDesigner(game_id, designer) {
  let id = designer.id;
  let name = designer.value;

  return knex("designers")
    .insert({
      id,
      name,
    })
    .onConflict("id")
    .ignore()
    .then(() => {
      return knex("my_games_designers")
        .insert({
          game_id,
          designer_id: id,
        })
        .onConflict(["game_id", "designer_id"])
        .ignore();
    });
}

function postGameExpansion(game_id, expansion) {
  let id = expansion.id;
  let name = expansion.value;

  return knex("expansions")
    .insert({
      id,
      name,
    })
    .onConflict("id")
    .ignore()
    .then(() => {
      return knex("my_games_expansions")
        .insert({
          game_id,
          expansion_id: id,
        })
        .onConflict(["game_id", "expansion_id"])
        .ignore();
    });
}

function postGameFamily(game_id, family) {
  let id = family.id;
  let name = family.value;

  return knex("families")
    .insert({
      id,
      name,
    })
    .onConflict("id")
    .ignore()
    .then(() => {
      return knex("my_games_families")
        .insert({
          game_id,
          family_id: id,
        })
        .onConflict(["game_id", "family_id"])
        .ignore();
    });
}

function postGameImplementation(game_id, implementation) {
  let id = implementation.id;
  let name = implementation.value;

  return knex("implementations")
    .insert({
      id,
      name,
    })
    .onConflict("id")
    .ignore()
    .then(() => {
      return knex("my_games_implementations")
        .insert({
          game_id,
          implementation_id: id,
        })
        .onConflict(["game_id", "implementation_id"])
        .ignore();
    });
}

function postGameMechanic(game_id, mechanic) {
  let id = mechanic.id;
  let name = mechanic.value;

  return knex("mechanics")
    .insert({
      id,
      name,
    })
    .onConflict("id")
    .ignore()
    .then(() => {
      return knex("my_games_mechanics")
        .insert({
          game_id,
          mechanic_id: id,
        })
        .onConflict(["game_id", "mechanic_id"])
        .ignore();
    });
}

function postGamePublisher(game_id, publisher) {
  let id = publisher.id;
  let name = publisher.value;

  return knex("publishers")
    .insert({
      id,
      name,
    })
    .onConflict("id")
    .ignore()
    .then(() => {
      return knex("my_games_publishers")
        .insert({
          game_id,
          publisher_id: id,
        })
        .onConflict(["game_id", "publisher_id"])
        .ignore();
    });
}

async function batchUpdateGameRanks(gamesToUpdate) {
  try {
    await knex.transaction(async (trx) => {
      for (const game of gamesToUpdate) {
        await trx("my_games")
          .where({ id: game.id })
          .update({ rank: game.newRank });
      }
    });

    return true;
  } catch (error) {
    console.error("Error updating game ranks:", error);
    throw error;
  }
}

function patchGameFavorite(game, favorite) {
  let id = game.id;

  return knex("my_games").where({ id }).update({ isFavorite: favorite });
}

function deleteGame(id) {
  return knex("my_games").delete().where({ id });
}

function postGroup(groupName) {
  return knex("groups").insert({ name: groupName });
}

function getGroups() {
  return knex("groups")
    .select("*")
    .then((data) => data)
    .catch((err) => err);
}

function getDifference(gameIdsDb, gameIdsBGG) {
  const gameIdsBGGSet = new Set(gameIdsBGG);
  const difference = gameIdsDb.filter((id) => !gameIdsBGGSet.has(id));
  return difference;
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

function getPlayers() {
  return knex("players")
    .select("*")
    .then((data) => data)
    .catch((err) => err);
}

function postPlayer(first_name, last_name) {
  return knex("players").insert({ first_name, last_name }).returning("*");
}

function postSession(
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
  if (winner_score === 0 || winner_score === "") winner_score=null;
  let player_count = activePlayers.length;

  if (!(game_type === "cooperative" || game_type === "semi-cooperative")) {
    coop_did_win = null;
  }
  return knex("sessions")
    .insert({
      game_id,
      game_type,
      coop_did_win,
      notes,
      date,
      //is_historic,
      duration,
      winner_score,
      player_count
    })
    .returning("id")
    .then((result) => {
      const sessionId = result[0].id;
      return sessionId; 
    });
}

function postSessionPlayers(sessionId, activePlayers) {
  const sessionPlayers = activePlayers.map(player => ({
    session_id: sessionId,
    player_id: player.id,  
    is_winner: player.isWinner
  }));

  return knex("sessions_players").insert(sessionPlayers);
}

function getSessions() {
  return knex("sessions")
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
    )
    .then((data) => {
      const sessions = [];
      data.forEach(row => {
        let session = sessions.find(session => session.session_id === row.session_id);
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
            players: []
          };
          sessions.push(session);
        }
        session.players.push({
          playerId: row.player_id,
          firstName: row.first_name,
          lastName: row.last_name,
          isWinner: row.is_winner
        });
      });
      return sessions;
    })
    .catch((err) => {
      console.error(err);
      throw err; 
    });
}

function deleteSession(id) {
  return knex("sessions").delete().where({ id });
}


module.exports = {
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
  deleteSession
};
