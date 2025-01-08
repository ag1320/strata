exports.up = function (knex) {
  return knex.schema.createTable("sessions", (table) => {
    table.increments("id").primary();
    table
      .integer("game_id")
      .unsigned()
      .references("id")
      .inTable("my_games")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("game_type");
    table.boolean("coop_did_win");
    table.text("notes");
    table.date("date");
    table.boolean("is_historic").defaultTo(false);
    table.integer("duration");
    table.integer("winner_score");
    table.integer("player_count");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("sessions");
};
