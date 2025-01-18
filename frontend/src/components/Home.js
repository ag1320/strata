import { AppContext } from "../AppContext.js";
import { Box, Grid, Typography } from "@mui/material";
import { useEffect, useContext, useState } from "react";
import "../styling/Home.css";
import bgg from "../images/BGG.jpeg";
import hotGamesPic from "../images/hot-games.png";
import ClickableMiniGameCard from "./ClickableMiniGameCard.js";
import GameCarousel from "./GameCarousel.js";
import { getGameIds } from "../helper-functions/dataSanitization.js";
import {
  getHotGames,
  getSpecificGamesDetailed,
} from "../helper-functions/serverCalls.js";

const Home = () => {
  let { hotGames, setHotGames } = useContext(AppContext);
  let { hotGamesDetailed, setHotGamesDetailed } = useContext(AppContext);
  let [hotGamesIds, setHotGamesIds] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getHotGames().then((games) => {
      if (isMounted) {
        setHotGames(games);
      }
    });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      setHotGamesIds(getGameIds(hotGames, true));
    }
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotGames]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted && hotGames.length > 0) {
      getSpecificGamesDetailed(hotGamesIds).then((games) => {
        games.map((game)=>{
          game.name = game.name[0].$.value
          game.image = game.image[0]
          game.min_players = game.minplayers[0].$.value
          game.max_players = game.maxplayers[0].$.value
          game.playingtime = game.playingtime[0].$.value
          game.url = "https://boardgamegeek.com/boardgame/"+game.$.id
        })
        setHotGamesDetailed(games);
      });
    }
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotGamesIds]);

  return (
    <Box className="game-grid">
      <Grid container direction="row" spacing={3} className="grid-container">
        <Grid item xs={12} className="overlay-container">
          <div className="overlay-wrapper">
            <img src={bgg} className="bgg-header" />
            <img src={hotGamesPic} className="bgg-header overlay-image" />
          </div>
        </Grid>
        <Grid item xs={12} className="grid-item-title">
          <Typography className="title" variant="h5">
            Top 5 Hot Games
          </Typography>
        </Grid>
        <Grid item xs={12} className="grid-item-title">
          <div className="line" />
        </Grid>
        <Grid item xs={12} className="grid-item">
          <GameCarousel/>
        </Grid>
        <Grid item xs={12} className="grid-item-title">
          <Typography className="title" variant="h5">
            Top 50 Hot Games
          </Typography>
        </Grid>
        <Grid item xs={12} className="grid-item-title">
          <div className="line" />
        </Grid>
        <>
          {hotGamesDetailed?.map((game, index) => {
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
                <ClickableMiniGameCard game={game} index={index} isDeletable={false}/>
              </Grid>
            );
          })}
        </>
      </Grid>
    </Box>
  );
};

export default Home;
