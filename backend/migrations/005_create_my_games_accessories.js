exports.up = function(knex) {
  return knex.schema.createTable("my_games_accessories", async (table) => {
    table.increments('games_accessories_id').primary();
    table.integer("game_id").unsigned().notNullable().references("id").inTable("my_games").onDelete("CASCADE");
    table.integer("accessory_id").unsigned().notNullable().references("id").inTable("accessories").onDelete("CASCADE");
    table.unique(["game_id", "accessory_id"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("my_games_accessories");
};