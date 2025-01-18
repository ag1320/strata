import { useState, useEffect } from "react";
import {
  Box,
  Chip,
  Typography,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import "../../styling/Teams.css";

const Teams = ({
  players,
  handleDeletePlayer,
  gameType,
  teamPlayers,
  setTeamPlayers,
  deletedPlayerId,
  newPlayer,
}) => {
  const [teams, setTeams] = useState(0);

  useEffect(() => {
    // Update teamPlayers based on gameType
    if (gameType === "cooperative" || gameType === "semi-cooperative"){
      setTeams(0);
      setTeamPlayers({
        1: [...players],
      });
    } else {
      setTeamPlayers({
        1: [...players],
      });
    }
    if (gameType === "teams") {
      handleAddTeam();
    }

    // // Ensure there are no extra players in teamPlayers
    // //THERE IS A BUG HERE THAT IS HARD TO REPLICATE
    // //for some reason, even though I am attempting to get rid of
    // //extra players, sometimes an extra player
    // //that is not in the activePlayers array still displays when
    // //gameType === "coopeartive". I am burned out trying to figure out why
    // const playerIds = new Set(players.map(player => player.id));
    
    // const updatedTeamPlayers = Object.keys(teamPlayers).reduce((acc, team) => {
    //   acc[team] = teamPlayers[team].filter(player => playerIds.has(player.id));
    //   return acc;
    // }, {});
  
    // setTeamPlayers(prevTeamPlayers => ({
    //   ...updatedTeamPlayers
    // }));


  
  }, [gameType]);
  


  //whenever a player is deleted remove them from the teams
  useEffect(() => {
    if (deletedPlayerId.id) {
      setTeamPlayers((prevTeams) => {
        const updatedTeams = Object.keys(prevTeams).reduce((acc, team) => {
          acc[team] = prevTeams[team].filter(
            (player) => player.id !== deletedPlayerId.id
          );
          return acc;
        }, {});
        return updatedTeams;
      });
    }
  }, [deletedPlayerId]);

  useEffect(() => {
    if (newPlayer && newPlayer.id) {
      setTeamPlayers((prevTeams) => {
        // Check if the player exists in any team
        const playerExists = Object.values(prevTeams).some((team) =>
          team.some((p) => p.id === newPlayer.id)
        );

        if (playerExists) {
          // If the player already exists in any team, do nothing
          return prevTeams;
        }

        // If player does not exist, add them to team 1
        return {
          ...prevTeams,
          1: [...(prevTeams[1] || []), newPlayer],
        };
      });
    }
  }, [newPlayer]);

  //when adding a team, keep players on existing teams, and an empty team
  const handleAddTeam = () => {
    const newTeamNumber = teams + 1;
    setTeams(newTeamNumber);
    setTeamPlayers((prev) => ({
      ...prev,
      [newTeamNumber + 1]: [],
    }));
  };

  const handleRemoveTeam = () => {
    if (teams > 0) {
      const newTeamPlayers = { ...teamPlayers };
      const removedTeamPlayers = newTeamPlayers[teams + 1];
      delete newTeamPlayers[teams + 1];

      setTeamPlayers({
        ...newTeamPlayers,
        1: [...newTeamPlayers[1], ...removedTeamPlayers],
      });
      setTeams(teams - 1);
    }
  };

  const handleDragStart = (e, player, teamId) => {
    e.dataTransfer.setData("player", JSON.stringify(player));
    e.dataTransfer.setData("teamId", teamId);
  };
  const handleDrop = (e, targetTeamId) => {
    const player = JSON.parse(e.dataTransfer.getData("player"));
    const sourceTeamId = e.dataTransfer.getData("teamId");

    if (sourceTeamId === targetTeamId) {
      // Do nothing if the source and target teams are the same
      return;
    }

    setTeamPlayers((prev) => {
      const sourceTeamPlayers = prev[sourceTeamId];
      const targetTeamPlayers = prev[targetTeamId];

      // Check if the player is already in the target team
      if (targetTeamPlayers.some((p) => p.id === player.id)) {
        return prev; // No changes if player is already in the target team
      }

      return {
        ...prev,
        [sourceTeamId]: sourceTeamPlayers.filter((p) => p.id !== player.id),
        [targetTeamId]: [...targetTeamPlayers, player],
      };
    });
  };

  const renderTeamColumns = () => {
    const columns = [];
    for (let i = 1; i <= teams + 1; i++) {
      columns.push(
        <Grid item xs key={i}>
          <Box
            onDrop={(e) => handleDrop(e, i)}
            onDragOver={(e) => e.preventDefault()}
            className={`team-box ${
              gameType === "cooperative" || gameType === "semi-cooperative"
                ? "team-box-cooperative"
                : teams > 0
                ? ""
                : "team-box-single"
            }`}
          >
            {gameType === "cooperative" || gameType === "semi-cooperative" ? (
              <Typography variant="h6" align="center">
                Team
              </Typography>
            ) : (
              teams > 0 &&
              gameType !== "cooperative" && (
                <Typography variant="h6" align="center">
                  Team {i}
                </Typography>
              )
            )}
            {teamPlayers[i] &&
              teamPlayers[i].map((player) => (
                <Chip
                  key={player.id}
                  label={player.name}
                  onDelete={() => handleDeletePlayer(player)}
                  onDragStart={(e) => handleDragStart(e, player, i)}
                  draggable
                  sx={{ margin: "4px" }}
                  className={`player-chip`}
                />
              ))}
          </Box>
        </Grid>
      );
    }
    return columns;
  };

  return (
    <Box>
      {gameType === "teams" && (
        <Box display="flex" justifyContent="center" mb={2}>
          <Tooltip title="Add a team">
            <IconButton onClick={handleAddTeam} color="primary">
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove the last team">
            <IconButton
              onClick={handleRemoveTeam}
              color="secondary"
              disabled={teams === 0}
            >
              <RemoveIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <Grid container spacing={2} justifyContent="center">
        {renderTeamColumns()}
      </Grid>
    </Box>
  );
};

export default Teams;
