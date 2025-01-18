import React from "react";
import {
  Card,
  Typography,
  CardMedia,
  IconButton,
  Tooltip,
} from "@mui/material";
import "../styling/MiniGameCard.css";
import CloseIcon from "@mui/icons-material/Close";

const MiniGameCard = ({
  game,
  index,
  isDeletable,
  handleDelete,
  activeGroup,
}) => {


  return (
    <>    
      <Card className="card">
        <div className="delete-mini-card-icon-container">
          {isDeletable && (
            <Tooltip title="Remove from Group" placement="top">
              <IconButton
                onClick={() => handleDelete(game.id, activeGroup.id)}
                className="delete-mini-card-icon"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>
        <div className="card-content">
          <Typography variant="body" className="mini-card-text">
            {index + 1}
          </Typography>
          <CardMedia
            component="img"
            image={game.thumbnail}
            className="card-media"
          />
          <Typography variant="body" component="div" className="mini-card-text">
            {game?.name?.[0]?.$?.value || game.name}
          </Typography>
        </div>
      </Card>
    </>
  );
};

export default MiniGameCard;
