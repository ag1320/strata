import { useEffect, useState } from "react";
import {
  getFriends,
  getFriendsGames,
} from "../../helper-functions/serverCalls";
import { sanitizeFriendsData } from "../../helper-functions/dataSanitization";
import { Card, CardContent, Typography, Grid, Button } from "@mui/material";
import "../../styling/Friends.css";
import ClickableMiniGameCard from "../ClickableMiniGameCard.js";
import FriendGamesModal from "./FriendGamesModal.js";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [friendsGames, setFriendsGames] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState({});
  const [openFriendModal, setOpenFriendModal] = useState(false);

  // Get friends from BGG
  useEffect(() => {
    getFriends().then((items) => {
      let sanitizedFriends = sanitizeFriendsData(items);
      setFriends(sanitizedFriends);
    });
  }, []);

  // Get friends' games from BGG
  useEffect(() => {
    if (friends.length > 0) {
      getFriendsGames(friends).then((items) => {
        setFriendsGames(items);
      });
    }
  }, [friends]);

  const handleOpenFriendModal = (friendIndex) => {
    setSelectedFriend(friendsGames[friendIndex]);
    setOpenFriendModal(true);
  };

  const handleCloseFriendModal = () => {
    setSelectedFriend({});
    setOpenFriendModal(false);
  };

  return (
    <>
      <FriendGamesModal
        selectedFriend={selectedFriend}
        open={openFriendModal}
        handleClose={handleCloseFriendModal}
      />
      <div className="friends-container">
        {friendsGames.map((friendGame, friendIndex) => {
          return (
            <Card key={friendIndex} className="friend-banner">
              <CardContent>
                <Typography variant="h5" className="friend-username">
                  {`${friendGame.name} - ${friendGame.games?.detailedGames?.length} Games`}
                </Typography>
                <Grid container spacing={2} className="friend-games">
                  {friendGame.games?.detailedGames
                    ?.slice(0, 5)
                    .map((game, gameIndex) => {
                      return (
                        <Grid item xs={2} sm={2} md={2} key={gameIndex}>
                          <ClickableMiniGameCard
                            game={game}
                            index={gameIndex}
                            isDeletable={false}
                          />
                        </Grid>
                      );
                    })}
                  <Grid item xs={12} className="see-more-container">
                    <Button
                      className="see-more-button"
                      onClick={() => handleOpenFriendModal(friendIndex)}
                    >
                      See More
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default Friends;
