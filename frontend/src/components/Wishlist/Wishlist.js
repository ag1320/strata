import { useContext } from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { AppContext } from "../../AppContext";
import GetWishlist from "./GetWishlist";
import WishlistCard from "./WishlistCard";
import "../../styling/Wishlist.css";

export default function Wishlist() {
  const { wishlist, wishlistRefresh, setWishlistRefresh, wishlistError } =
    useContext(AppContext);

  const handleRefresh = () => {
    setWishlistRefresh(!wishlistRefresh);
  };

  return (
    <>
      <GetWishlist />
      <Box className="wishlist-container">
        <Box className="wishlist-header">
          <Typography variant="h5" className="wishlist-title">
            My Wishlist
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            className="wishlist-refresh-btn"
          >
            Refresh from BGG
          </Button>
        </Box>
        <Grid container spacing={2} className="wishlist-grid">
          {wishlist.map((game) => (
            <Grid item key={game.id}>
              <WishlistCard game={game} />
            </Grid>
          ))}
        </Grid>
        {wishlistError ? (
          <Typography className="wishlist-error">{wishlistError}</Typography>
        ) : (
          wishlist.length === 0 && (
            <Typography className="wishlist-empty">
              No games on your BGG wishlist yet.
            </Typography>
          )
        )}
      </Box>
    </>
  );
}
