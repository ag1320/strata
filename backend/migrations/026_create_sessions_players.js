exports.up = function (knex) {
  return knex.schema.createTable("sessions_players", function (table) {
    table
      .integer("session_id")
      .unsigned()
      .references("sessions.id")
      .onDelete("CASCADE");
    table
      .integer("player_id")
      .unsigned()
      .references("players.id")
      .onDelete("CASCADE");
    table.boolean("is_winner").defaultTo(false);

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("sessions_players");
};
