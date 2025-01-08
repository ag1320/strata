exports.up = function(knex) {
  return knex.schema.createTable("my_games_expansions", async (table) => {
    table.increments('games_expansions_id').primary();
    table.integer("game_id").unsigned().notNullable().references("id").inTable("my_games").onDelete("CASCADE");
    table.integer("expansion_id").unsigned().notNullable().references("id").inTable("expansions").onDelete("CASCADE");
    table.unique(["game_id", "expansion_id"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("my_games_expansions");
};