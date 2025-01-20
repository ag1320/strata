import "../../styling/StatsGamesList.css";
import { Card, List, ListItem, ListItemText, Pagination } from "@mui/material";
import { useState } from "react";

const StatsGamesList = ({ sortedGames, handleSeePlays, title }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const startIndex = (page - 1) * itemsPerPage;
  const paginatedGames = sortedGames.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Card className="stats-card">
      <h2 className="stats-title">{title}</h2>
      <List className="stats-most-played-list">
        {paginatedGames.map((game, index) => (
          <ListItem key={game.id} className="stats-most-played-list-item">
            {title === "Most Played Games" ? (
              <ListItemText
                primary={`${startIndex + index + 1} - ${game.name}: ${
                  game.totalPlays
                } plays`}
                className="stats-most-played-list-text"
                onClick={() => handleSeePlays(game)}
              />
            ) : (
              <ListItemText
                primary={`${startIndex + index + 1} - ${game.name}: ${game.mostRecentDate? new Date(game.mostRecentDate).toLocaleDateString(): "Never"}`}
                className="stats-most-played-list-text"
                onClick={() => handleSeePlays(game)}
              />
            )}
          </ListItem>
        ))}
      </List>
      <Pagination
        count={Math.ceil(sortedGames.length / itemsPerPage)}
        page={page}
        onChange={handlePageChange}
        className="stats-pagination"
      />
    </Card>
  );
};

export default StatsGamesList;
