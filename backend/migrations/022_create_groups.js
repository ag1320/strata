exports.up = function(knex) {
  return knex.schema.createTable("groups", async (table) => {
    table.increments('id').primary();
    table.string("name")
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("groups");
};