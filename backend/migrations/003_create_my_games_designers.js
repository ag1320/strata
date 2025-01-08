exports.up = function(knex) {
  return knex.schema.createTable("my_games_designers", async (table) => {
    table.increments('games_designers_id').primary();
    table.integer("game_id").unsigned().notNullable().references("id").inTable("my_games").onDelete("CASCADE");
    table.integer("designer_id").unsigned().notNullable().references("id").inTable("designers").onDelete("CASCADE");
    table.unique(["game_id", "designer_id"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("my_games_designers");
};