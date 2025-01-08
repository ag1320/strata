exports.up = function(knex) {
  return knex.schema.createTable("my_games_compilations", async (table) => {
    table.increments('games_compilations_id').primary();
    table.integer("game_id").unsigned().notNullable().references("id").inTable("my_games").onDelete("CASCADE");
    table.integer("compilation_id").unsigned().notNullable().references("id").inTable("compilations").onDelete("CASCADE");
    table.unique(["game_id", "compilation_id"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("my_games_compilations");
};