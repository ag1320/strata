import { Card, CardMedia, Typography } from "@mui/material";
import "../../styling/WishlistCard.css";

const WishlistCard = ({ game }) => {
  const handleCardClick = () => {
    window.open(game.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="wishlist-card" onClick={handleCardClick}>
      <CardMedia
        component="img"
        image={game.thumbnail || game.image}
        alt={game.name}
        className="wishlist-card-media"
      />
      <Typography variant="body2" className="wishlist-card-name">
        {game.name}
      </Typography>
      {game.comment && (
        <Typography variant="caption" className="wishlist-card-comment">
          {game.comment}
        </Typography>
      )}
    </Card>
  );
};

export default WishlistCard;
