exports.up = function(knex) {
  return knex.schema.createTable("my_games_artists", async (table) => {
    table.increments('games_artists_id').primary();
    table.integer("game_id").unsigned().notNullable().references("id").inTable("my_games").onDelete("CASCADE");
    table.integer("artist_id").unsigned().notNullable().references("id").inTable("artists").onDelete("CASCADE");
    table.unique(["game_id", "artist_id"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("my_games_artists");
};