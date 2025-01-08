exports.up = function(knex) {
  return knex.schema.createTable("my_games_categories", async (table) => {
    table.increments('games_categories_id').primary();
    table.integer("game_id").unsigned().notNullable().references("id").inTable("my_games").onDelete("CASCADE");
    table.integer("category_id").unsigned().notNullable().references("id").inTable("categories").onDelete("CASCADE");
    table.unique(["game_id", "category_id"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("my_games_categories");
};