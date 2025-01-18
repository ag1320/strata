import { Modal, Box, Grid, Fab, Typography } from "@mui/material";
import MiniGameCard from "../MiniGameCard";
import "../../styling/EditRankingsModal.css";
import { useState, useEffect, useContext } from "react";
import { sortGames } from "../../helper-functions/dataSanitization";
import SaveIcon from "@mui/icons-material/Save";
import { AppContext } from "../../AppContext";
import { patchGameRanks } from "../../helper-functions/serverCalls";

const EditRankingsModal = ({ myGames, open, handleClose }) => {
  const [sortedGames, setSortedGames] = useState([]);
  let {refresh, setRefresh} = useContext(AppContext)


  useEffect(() => {
    setSortedGames(sortGames(myGames, "rank", true));
  }, [myGames]);

  // Function to handle drag and drop and update new ranks
  const handleDragDrop = (dragIndex, dropIndex) => {
    const updatedGames = [...sortedGames];
    const draggedGame = updatedGames[dragIndex];

    updatedGames.splice(dragIndex, 1);

    updatedGames.splice(dropIndex, 0, draggedGame);

    updatedGames.forEach((game, index) => {
      game.newRank = index + 1;
    });

    setSortedGames(updatedGames);
  };

  const saveRankings = () => {
    patchGameRanks(sortedGames)
    setRefresh(!refresh)
    handleClose()
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="modal"
    >
      <Box className="modal-box-edit-rankings">
        <div className="modal-content">
          <Grid container spacing={2} className="grid-container">
            <Grid item xs={12} className="grid-item">
              <Typography className="text" variant="h5">
                Drag and drop the games, then click the save icon
              </Typography>
            </Grid>
            {sortedGames?.map((game, index) => (
              <Grid
                item
                xs={6}
                sm={4}
                md={3}
                lg={2}
                key={index}
                className="grid-item-edit-rankings"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", index.toString());
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dragIndex = Number(
                    e.dataTransfer.getData("text/plain")
                  );
                  handleDragDrop(dragIndex, index);
                }}
              >
                <MiniGameCard game={game} index={index} isDeletable={false}/>
              </Grid>
            ))}
          </Grid>
          <Fab className="save-fab" onClick={saveRankings}>
            <Typography className="text fab-text">Save Rankings</Typography>
            <SaveIcon />
          </Fab>
        </div>
      </Box>
    </Modal>
  );
};

export default EditRankingsModal;
