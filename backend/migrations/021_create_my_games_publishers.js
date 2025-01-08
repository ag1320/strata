exports.up = function(knex) {
  return knex.schema.createTable("my_games_publishers", async (table) => {
    table.increments('games_publishers_id').primary();
    table.integer("game_id").unsigned().notNullable().references("id").inTable("my_games").onDelete("CASCADE");
    table.integer("publisher_id").unsigned().notNullable().references("id").inTable("publishers").onDelete("CASCADE");
    table.unique(["game_id", "publisher_id"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("my_games_publishers");
};