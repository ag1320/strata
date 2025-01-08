exports.up = function(knex) {
  return knex.schema.createTable("my_games_groups", async (table) => {
    table.increments('games_groups_id').primary();
    table.integer("game_id").unsigned().notNullable().references("id").inTable("my_games").onDelete("CASCADE");
    table.integer("group_id").unsigned().notNullable().references("id").inTable("groups").onDelete("CASCADE");
    table.unique(["game_id", "group_id"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("my_games_groups");
};