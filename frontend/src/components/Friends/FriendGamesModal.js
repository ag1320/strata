import { Modal, Box, Grid, Typography } from "@mui/material";
import ClickableMiniGameCard from "../ClickableMiniGameCard";
import "../../styling/FriendGamesModal.css";

const FriendGamesModal = ({ selectedFriend, open, handleClose }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="modal"
    >
      <Box className="modal-box-friend-games">
        <div className="modal-header">
          <Typography variant="h5" className="modal-title">
            {`${selectedFriend?.name} - ${selectedFriend?.games?.detailedGames?.length} Games`}
          </Typography>
        </div>
        <div className="modal-content">
          <Grid container spacing={2} className="grid-container">
            {selectedFriend?.games?.detailedGames?.map((game, index) => (
              <Grid
                item
                xs={6}
                sm={4}
                md={3}
                lg={2}
                key={index}
                className="grid-item-friend-game"
              >
                <ClickableMiniGameCard game={game} index={index} isDeletable={false} />
              </Grid>
            ))}
          </Grid>
        </div>
      </Box>
    </Modal>
  );
};

export default FriendGamesModal;
