import React from "react";
import GameCard from "./MyCollection/GameCard";
import { useContext } from "react";
import { AppContext } from "../AppContext";
import { useTheme } from "@mui/material/styles";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import SwipeableViews from "react-swipeable-views";
import { autoPlay } from "react-swipeable-views-utils";
import "../styling/GameCarousel.css";
import {
  extractGameAttributes,
  removeLinks,
} from "../helper-functions/dataSanitization";
import {
  Box,
  Grid,
  MobileStepper,
  Paper,
  Typography,
  Button,
} from "@mui/material";

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const GameCarousel = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  let { hotGamesDetailed } = useContext(AppContext);
  let hotGamesDetailedFirstFive = hotGamesDetailed.slice(0,5)
  const maxSteps = hotGamesDetailedFirstFive.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  return (
    <Box className="carousel-container">
      <Paper square elevation={0} className="carousel-title">
        <Grid container>
          <Grid item xs={12} className="grid-item">
            <Typography className="carousel-text" variant="h5">
              {(activeStep + 1).toString() +
                " - " +
                hotGamesDetailedFirstFive[activeStep]?.name}
            </Typography>
          </Grid>
          <Grid item xs={12} className="grid-item">
            <Typography variant="body2" component="p" className="carousel-text">
              {hotGamesDetailedFirstFive[activeStep]?.yearpublished?.[0]?.$?.value}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <AutoPlaySwipeableViews
        axis={theme.direction === "rtl" ? "x-reverse" : "x"}
        index={activeStep}
        onChangeIndex={handleStepChange}
        enableMouseEvents
      >
        {hotGamesDetailedFirstFive.map((game, index) => {
          game.attributes = extractGameAttributes(game);
          removeLinks(game);
          return (
            <div key={index}>
              {Math.abs(activeStep - index) <= 2 ? (
                <GameCard key={index} game={game} isExpandable={false} />
              ) : null}
            </div>
          );
        })}
      </AutoPlaySwipeableViews>
      <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        className="mobile-stepper"
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
            className="button"
          >
            Next
            {theme.direction === "rtl" ? (
              <KeyboardArrowLeft />
            ) : (
              <KeyboardArrowRight />
            )}
          </Button>
        }
        backButton={
          <Button
            size="small"
            onClick={handleBack}
            disabled={activeStep === 0}
            className="button"
          >
            {theme.direction === "rtl" ? (
              <KeyboardArrowRight />
            ) : (
              <KeyboardArrowLeft />
            )}
            Back
          </Button>
        }
      />
    </Box>
  );
};

export default GameCarousel;
