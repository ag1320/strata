import { Button, Grid } from "@mui/material";
import "../../styling/MyCollectionGroupsGames.css";
import { useContext, useState, useEffect } from "react";
import AddGamesModal from "./AddGamesModal";
import { AppContext } from "../../AppContext";
import { filterGamesByGroups } from "../../helper-functions/dataSanitization";
import MiniGameCard from "../MiniGameCard";
import { deleteGamesGroups } from "../../helper-functions/serverCalls";

const MyCollectionGroupsGames = ({ activeGroupId, groups }) => {
  let [openAddGamesModal, setOpenAddGamesModal] = useState(false);
  let { myGames } = useContext(AppContext);
  let {refresh, setRefresh} = useContext(AppContext)
  let {setSnackbarError, setSnackbarSuccess} = useContext(AppContext)
  let filteredGames = [];

  const handleAddGames = () => {
    setOpenAddGamesModal(true);
  };

  const handleAddGamesModalClose = () => {
    setOpenAddGamesModal(false);
  };

  const handleDelete = (gameId, groupId) => {
    deleteGamesGroups(
      groupId,
      gameId,
      refresh,
      setRefresh,
      setSnackbarError,
      setSnackbarSuccess
    );
  };

  let activeGroup = {};
  if (activeGroupId !== -1) {
    activeGroup = groups.filter((group) => group.id === activeGroupId)[0];
    filteredGames = filterGamesByGroups(myGames, [activeGroup]);
  }
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      if (activeGroupId !== -1) {
        activeGroup = groups.filter((group) => group.id === activeGroupId)[0];
        filteredGames = filterGamesByGroups(myGames, [activeGroup]);
      }
    }
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myGames]);

  return (
    <>
      <AddGamesModal
        open={openAddGamesModal}
        handleClose={handleAddGamesModalClose}
        activeGroup={activeGroup}
        filteredGames = {filteredGames}
      />
      <Grid container className="grid-container-groups-games" spacing={2}>
        <Grid item xs={12}>
          <Button
            className="add-games-to-group-button"
            onClick={handleAddGames}
          >
            {`Add Games to ${activeGroup?.name}`}
          </Button>
        </Grid>
        {filteredGames.map((game, index) => {
          return (
            <Grid
              item
              xs={6}
              sm={4}
              md={3}
              lg={2}
              key={index}
              className="grid-item"
            >
              <MiniGameCard
                game={game}
                index={index}
                isDeletable={true}
                handleDelete={handleDelete}
                activeGroup={activeGroup}
              />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export default MyCollectionGroupsGames;
