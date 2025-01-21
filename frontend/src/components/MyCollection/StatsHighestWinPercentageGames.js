import { useState } from "react";
import {
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Pagination,
} from "@mui/material";
import "../../styling/StatsHighestWinPercentageGames.css";

const StatsHighestWinPercentageGames = ({ games, handleGameClick }) => {
  // State to track the current page
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 7;

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Slice the games array based on the current page
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);

  return (
    <>
      {games.length > 0 ? (
        <>
          <Grid item xs={12}>
            <Typography variant="h5">
              {`Games With the Highest Win Percentage (${games[0]?.winPercentage}%):`}
            </Typography>
          </Grid>
          <List className="player-stats-list">
            {currentGames.map((game) => (
              <ListItem
                key={game?.name}
                className="player-stats-list-item"
                onClick={() => handleGameClick(game.name)}
              >
                <ListItemText
                  primary={`${game?.name}`}
                  className="player-stats-list-item-text"
                />
              </ListItem>
            ))}
          </List>

          {/* Pagination */}
          <Pagination
            count={Math.ceil(games.length / gamesPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            classes={{ 
              // Apply custom class to the current page
              dot: 'pagination-item',
              selected: 'pagination-item-active', 
            }}
          />
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default StatsHighestWinPercentageGames;
