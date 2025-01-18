import React, { useContext, useState, useEffect, memo } from "react";
import {
  Card,
  CardActions,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  Chip,
  Tooltip,
  Grid,
  Menu,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import "../../styling/GameCard.css";
import { AppContext } from "../../AppContext";
import { makeUniqueFilterChips } from "../../helper-functions/dataSanitization";
import AddFolderIcon from "../../images/AddFolderIcon";
import MeepleIcon from "../../images/Meeple";
import GroupAutocomplete from "./GroupAutocomplete";
import CloseIcon from "@mui/icons-material/Close";
import {
  patchGameFavorite,
  postGamesGroups,
  postGroup,
  deleteGamesGroups,
} from "../../helper-functions/serverCalls";

const GameCard = memo(({
  game,
  isExpandable,
  handleLogPlayClick,
  handleSeePlays,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showMechanics, setShowMechanics] = useState(false);
  const [showArtists, setShowArtists] = useState(false);
  const [showDesigners, setShowDesigners] = useState(false);
  const [showPublishers, setShowPublishers] = useState(false);
  const [showGroupAutocomplete, setShowGroupAutocomplete] = useState(false);
  const [groupInputValue, setGroupInputValue] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  let { attributeFilterChips, setAttributeFilterChips } =
    useContext(AppContext);
  let { refresh, setRefresh } = useContext(AppContext);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);
  let { groups } = useContext(AppContext);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleFavorite = () => {
    patchGameFavorite(game, !game.isFavorite);

    setRefresh(!refresh);
  };

  const handleAddFolderClick = () => {
    setShowGroupAutocomplete(!showGroupAutocomplete);
  };

  const handleCloseAddFolder = () => {
    setShowGroupAutocomplete(false);
  };

  const handleDeleteChip = (groupId) => {
    deleteGamesGroups(
      groupId,
      game.id,
      refresh,
      setRefresh,
      setSnackbarError,
      setSnackbarSuccess
    );
  };

  const handleGroupSelect = (event) => {
    let groupObj = {};

    if (event.key === "Tab") {
      event.preventDefault();
      const closestGroup = groups.find((group) =>
        group.name.toLowerCase().includes(groupInputValue.toLowerCase())
      );
      if (closestGroup) {
        setSelectedGroup(closestGroup.name);
        setGroupInputValue(closestGroup.name);
      }
    } else if (event.key === "Enter") {
      groupObj = groups.find((group) => group.name === selectedGroup);
      if (groupObj) {
        let gameId = game.id;
        let groupId = groupObj.id;
        let inputs = {
          gameId,
          groupId,
          refresh,
          setRefresh,
          setSnackbarError,
          setSnackbarSuccess,
        };

        //if group doesn't exist, first post the group, then post to join table games_groups
        if (!groups.some((group) => group.name === groupObj.name)) {
          postGroup(groupObj.name, refresh, setRefresh).then(() => {
            postGamesGroups(inputs);
          });
        } else {
          postGamesGroups(inputs);
        }
      }
      setSelectedGroup(null);
      setGroupInputValue("");
    }
  };

  //attributes
  let categories = game?.attributes?.categories;
  let mechanics = game?.attributes?.mechanics;
  let artists = game?.attributes?.artists;
  let designers = game?.attributes?.designers;
  let publishers = game?.attributes?.publishers;

  const addFilterChip = (attribute, attributeString) => {
    attribute.type = attributeString;
    let attributeFilterChipsCopy = attributeFilterChips;
    attributeFilterChipsCopy.push(attribute);
    let attributeFilterChipsCopyUnique = makeUniqueFilterChips(
      attributeFilterChipsCopy
    );
    setAttributeFilterChips(attributeFilterChipsCopyUnique);

    setExpanded(false);
  };

  return (
    <>
      <Card className="root">
        {isExpandable && (
          <>
            <Typography className="text title" variant="h5">
              {game?.name}
            </Typography>
          </>
        )}
        <div className="media-container">
          <img src={game?.image} className="media" alt={game?.name} />
        </div>
        <CardContent>
          <Typography variant="body2" component="p" className="text">
            Players: {game?.min_players + " - " + game?.max_players}
          </Typography>
          <Typography variant="body2" component="p" className="text">
            Playtime: {game?.playingtime} min
          </Typography>
          <a
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bgg-link"
          >
            <Typography variant="body2" component="p" className="text">
              BGG
            </Typography>
          </a>
        </CardContent>
        {isExpandable && (
          <>
            <CardActions disableSpacing>
              <IconButton
                className={expanded ? "expandOpen" : "expand"}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
              >
                <ExpandMoreIcon className="icon" />
              </IconButton>
              <Tooltip title="Add to Group" placement="top">
                <IconButton
                  className="add-folder-icon-button"
                  onClick={handleAddFolderClick}
                >
                  <AddFolderIcon />
                </IconButton>
              </Tooltip>
              <IconButton
                className="meeple-icon-button"
                onClick={handleOpenMenu}
              >
                <MeepleIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={() => handleLogPlayClick(game)}>
                  Log a Play Session
                </MenuItem>
                <MenuItem onClick={() => handleSeePlays(game)}>
                  See Play Sessions
                </MenuItem>
              </Menu>
              <Tooltip title="Add to Favorites" placement="top">
                <IconButton
                  className="favorite-icon-button"
                  onClick={handleFavorite}
                >
                  <FavoriteIcon
                    className={`favorite-icon ${
                      game.isFavorite ? "is-favorite" : ""
                    }`}
                  />
                </IconButton>
              </Tooltip>
            </CardActions>
            {showGroupAutocomplete && (
              <Grid container spacing={1} className="grid-container-groups">
                <Grid item xs={2}>
                  <Tooltip title="Close Groups" placement="top">
                    <IconButton onClick={handleCloseAddFolder}>
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={10}>
                  <GroupAutocomplete
                    handleGroupSelect={handleGroupSelect}
                    setSelectedGroup={setSelectedGroup}
                    groupInputValue={groupInputValue}
                    setGroupInputValue={setGroupInputValue}
                    classNameToUse={""}
                  />
                </Grid>
                {game.attributes.groups.map((group) => {
                  return (
                    <Grid item xs={"auto"}>
                      <Chip
                        key={group.id}
                        label={group.name}
                        variant="outlined"
                        className="chip"
                        onDelete={() => handleDeleteChip(group.id)}
                        deleteIcon={
                          <IconButton size="small">
                            <CloseIcon />
                          </IconButton>
                        }
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <CardContent>
                {categories.length > 0 && (
                  <>
                    <Typography
                      paragraph
                      onClick={() => setShowCategories(!showCategories)}
                      style={{ cursor: "pointer" }}
                      className="text"
                    >
                      Categories:
                    </Typography>
                    {showCategories &&
                      categories.map((category) => (
                        <Chip
                          key={category.id}
                          label={category.name}
                          variant="outlined"
                          className="chip"
                          onClick={() => addFilterChip(category, "category")}
                        />
                      ))}
                  </>
                )}
                {mechanics.length > 0 && (
                  <>
                    <Typography
                      paragraph
                      onClick={() => setShowMechanics(!showMechanics)}
                      style={{ cursor: "pointer" }}
                      className="text"
                    >
                      Mechanics:
                    </Typography>
                    {showMechanics &&
                      mechanics.map((mechanic) => (
                        <Chip
                          key={mechanic.id}
                          label={mechanic.name}
                          variant="outlined"
                          className="chip"
                          onClick={() => addFilterChip(mechanic, "mechanic")}
                        />
                      ))}
                  </>
                )}
                {artists.length > 0 && (
                  <>
                    <Typography
                      paragraph
                      onClick={() => setShowArtists(!showArtists)}
                      style={{ cursor: "pointer" }}
                      className="text"
                    >
                      Artists:
                    </Typography>
                    {showArtists &&
                      artists.map((artist) => (
                        <Chip
                          key={artist.id}
                          label={artist.name}
                          variant="outlined"
                          className="chip"
                          onClick={() => addFilterChip(artist, "artist")}
                        />
                      ))}
                  </>
                )}
                {designers.length > 0 && (
                  <>
                    <Typography
                      paragraph
                      onClick={() => setShowDesigners(!showDesigners)}
                      style={{ cursor: "pointer" }}
                      className="text"
                    >
                      Designers:
                    </Typography>
                    {showDesigners &&
                      designers.map((designer) => (
                        <Chip
                          key={designer.id}
                          label={designer.name}
                          variant="outlined"
                          className="chip"
                          onClick={() => addFilterChip(designer, "designer")}
                        />
                      ))}
                  </>
                )}
                {publishers.length > 0 && (
                  <>
                    <Typography
                      paragraph
                      onClick={() => setShowPublishers(!showPublishers)}
                      style={{ cursor: "pointer" }}
                      className="text"
                    >
                      Publishers:
                    </Typography>
                    {showPublishers &&
                      publishers.map((publisher) => (
                        <Chip
                          key={publisher.id}
                          label={publisher.name}
                          variant="outlined"
                          className="chip"
                          onClick={() => addFilterChip(publisher, "publisher")}
                        />
                      ))}
                  </>
                )}
              </CardContent>
            </Collapse>
          </>
        )}
      </Card>
    </>
  );
});

export default GameCard;
