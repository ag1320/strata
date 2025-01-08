exports.up = function(knex) {
  return knex.schema.createTable("my_games_implementations", async (table) => {
    table.increments('games_implementations_id').primary();
    table.integer("game_id").unsigned().notNullable().references("id").inTable("my_games").onDelete("CASCADE");
    table.integer("implementation_id").unsigned().notNullable().references("id").inTable("implementations").onDelete("CASCADE");
    table.unique(["game_id", "implementation_id"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("my_games_implementations");
};