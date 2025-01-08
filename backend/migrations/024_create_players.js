exports.up = function(knex) {
  return knex.schema.createTable("players", (table) => {
    table.increments('id').primary();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    
    // Add a unique index with lower case to ensure case-insensitive uniqueness
    table.unique(['first_name', 'last_name'], 'unique_player_names');
  }).then(() => {
    // Use raw query to create a case-insensitive unique index
    return knex.raw(`
      CREATE UNIQUE INDEX unique_player_names_case
      ON players (LOWER(first_name), LOWER(last_name));
    `);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("players");
};
