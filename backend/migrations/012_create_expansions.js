exports.up = function(knex) {
  return knex.schema.createTable("expansions", async (table) => {
    table.integer('id').primary();
    table.string("name").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("expansions");
};