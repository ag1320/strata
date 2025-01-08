exports.up = function (knex) {
  return knex.schema.createTable("my_games", async (table) => {
    table.integer('id').primary();
    table.string("name")
    table.string("year_published")
    table.string("type")
    table.text("description")
    table.string("image")
    table.string("thumbnail")
    table.string("max_players")
    table.string("min_players")
    table.string("max_playtime")
    table.string("min_playtime")
    table.string("playingtime")
    table.string("min_age")
    table.integer("rank")
    table.string("url")
    table.boolean("isFavorite").defaultTo(false)
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("my_games");
};