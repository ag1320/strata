exports.up = function(knex) {
  return knex.schema.createTable("my_games_mechanics", async (table) => {
    table.increments('games_mechanics_id').primary();
    table.integer("game_id").unsigned().notNullable().references("id").inTable("my_games").onDelete("CASCADE");
    table.integer("mechanic_id").unsigned().notNullable().references("id").inTable("mechanics").onDelete("CASCADE");
    table.unique(["game_id", "mechanic_id"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("my_games_mechanics");
};