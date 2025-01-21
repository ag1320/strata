import { Grid, Typography, List, ListItem, ListItemText } from "@mui/material";
import "../../styling/StatsPlayerMost.css";

const StatsPlayerMost = ({ selectedPlayer, handleGameClick }) => {
  //This was messy in the main file so I abstracted it to its own component

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5">Most Played:</Typography>
        <List className="player-stats-list">
          {selectedPlayer?.top_three_games_by_num_plays.map((game) => (
            <ListItem
              key={game.name}
              onClick={() => handleGameClick(game.name)}
              className="player-stats-list-item"
            >
              <ListItemText
                primary={`${game.name} (${game.total_plays})`}
                className="player-stats-list-item-text"
              />
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5">Most Recently Played:</Typography>
        <List className="player-stats-list">
          {selectedPlayer?.top_three_most_recent_games.map((game) => (
            <ListItem
              key={game.name}
              className="player-stats-list-item"
              onClick={() => handleGameClick(game.name)}
            >
              <ListItemText
                className="player-stats-list-item-text"
                primary={`${game.name} (${new Date(
                  game.most_recent_date
                ).toLocaleDateString()})`}
              />
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  );
};

export default StatsPlayerMost;
