exports.up = function(knex) {
  return knex.schema.createTable("my_games_families", async (table) => {
    table.increments('games_families_id').primary();
    table.integer("game_id").unsigned().notNullable().references("id").inTable("my_games").onDelete("CASCADE");
    table.integer("family_id").unsigned().notNullable().references("id").inTable("families").onDelete("CASCADE");
    table.unique(["game_id", "family_id"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("my_games_families");
};