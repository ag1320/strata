exports.up = function (knex) {
  return knex.schema.table('players', (table) => {
    table.json('top_three_games_by_num_plays')
    table.json('top_three_most_recent_games')
    table.json('games_with_highest_win_percentage')
    table.integer('total_wins')
    table.integer('win_percentage')
    table.integer('total_plays')
  });
};

exports.down = function (knex) {
  return knex.schema.table('players', (table) => {
    table.dropColumn('top_three_games_by_num_plays');
    table.dropColumn('top_three_most_recent_games');
    table.dropColumn('total_wins');
    table.dropColumn('win_percentage');
    table.dropColumn('total_plays');
  });
};
