import "../../styling/MyCollectionGroups.css";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Tooltip,
  IconButton,
  Typography,
  TextField,
  Stack,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useState, useRef, useEffect, useContext } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MyCollectionGroupsGames from "./MyCollectionGroupsGames";
import { AppContext } from "../../AppContext";
import {
  postGroup,
  patchGroup,
  deleteGroup,
} from "../../helper-functions/serverCalls";

const FolderIcon = ({ isSelected }) => {
  return (
    <svg
      version="1.1"
      viewBox="0 0 175.12 139.25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(-21.142 -91.084)">
        <path
          d="m39.871 94.359 0.0031 0.0682h-1.7544c-7.5967 0-13.712 6.1156-13.712 13.712v31.399c0 0.51149 0.03226 1.0149 0.0863 1.5115v70.997c0 8.3239 6.701 15.025 15.025 15.025h138.45c8.3239 0 15.025-6.701 15.025-15.025v-84.849c0-8.3239-6.7016-15.025-15.025-15.025h-69.546l-18.067-17.657z"
          fill="none"
          stroke="currentColor"
          strokeWidth="6.5302"
          className={`group-folder-icon ${isSelected ? "selected" : ""}`}
        />
      </g>
    </svg>
  );
};

const MyCollectionGroups = () => {
  let [isAddClicked, setIsAddClicked] = useState(false);
  let [groupName, setGroupName] = useState("");
  let [editId, setEditId] = useState(-1);
  let [activeGroupId, setActiveGroupId] = useState(-1);
  const handleAddGroup = () => setIsAddClicked(true);
  const addGroupRef = useRef(null);
  const editGroupRef = useRef(null);

  let { groups } = useContext(AppContext);
  let { refresh, setRefresh } = useContext(AppContext);

  const handleTextFieldChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (editId === -1) {
        setIsAddClicked(false);
        postGroup(groupName, refresh, setRefresh).then(() => {
          setGroupName("");

          setRefresh(!refresh);
        });
      } else {
        setEditId(-1);
        patchGroup(editId, groupName).then(() => {
          setGroupName("");

          setRefresh(!refresh);
        });
      }
    }
  };

  const handleClickOutside = (event) => {
    if (
      (addGroupRef.current && !addGroupRef.current.contains(event.target)) ||
      (editGroupRef.current && !editGroupRef.current.contains(event.target))
    ) {
      setIsAddClicked(false);
      setEditId(-1);
      setGroupName("");
    }
  };

  const editGroup = (group) => {
    setEditId(group.id);
  };

  const handleGroupClick = (group) => {
    setActiveGroupId(group.id);
  };

  useEffect(() => {
    if (isAddClicked || editId > -1) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddClicked, editId]);

  return (
    <Box className="my-collection-groups">
      <Grid container className="grid-container-groups ">
        <Grid item xs={"auto"} className="grid-item-groups">
          {!isAddClicked ? (
            <Tooltip title="Add a Group" placement="bottom">
              <IconButton onClick={handleAddGroup}>
                <Card className="add-group-card">
                  <CardContent className="add-group-card-content">
                    <AddCircleIcon className="add-group-icon" />
                  </CardContent>
                </Card>
              </IconButton>
            </Tooltip>
          ) : (
            <Card className="group-card" ref={addGroupRef}>
              <CardContent className="add-group-card-content">
                <FolderIcon className="group-folder-icon" />
                <Tooltip title="Press Enter to Submit" placement="bottom">
                  <TextField
                    variant="outlined"
                    placeholder="Enter Group Name"
                    size="small"
                    autoFocus
                    value={groupName}
                    onChange={handleTextFieldChange}
                    onKeyDown={handleKeyDown}
                    className="add-group-textfield"
                  />
                </Tooltip>
              </CardContent>
            </Card>
          )}
        </Grid>
        {groups.map((group, index) => {
          return (
            <>
              {group.id === editId ? (
                <Grid item xs={"auto"} className="grid-item-groups" key={index}>
                  <Card className="group-card" ref={editGroupRef}>
                    <CardContent className="add-group-card-content">
                      <FolderIcon className="group-folder-icon" />
                      <Tooltip title="Press Enter to Submit" placement="bottom">
                        <TextField
                          variant="outlined"
                          placeholder="Enter Group Name"
                          size="small"
                          autoFocus
                          value={groupName}
                          onChange={handleTextFieldChange}
                          onKeyDown={handleKeyDown}
                          className="add-group-textfield"
                        />
                      </Tooltip>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                <Grid item xs={"auto"} className="grid-item-groups" key={index}>
                  <Stack direction={"row"} spacing={0}>
                    <div className="delete-edit-icon-container">
                      <Stack direction={"column"} spacing={2}>
                        <IconButton onClick={() => editGroup(group)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            deleteGroup(
                              activeGroupId,
                              setActiveGroupId,
                              group,
                              refresh,
                              setRefresh
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </div>
                    <IconButton
                      className="group-folder"
                      onClick={() => handleGroupClick(group)}
                    >
                      <FolderIcon isSelected={group.id === activeGroupId} />
                      <Typography className="group-folder-text" variant="h6">
                        {group.name}
                      </Typography>
                    </IconButton>
                  </Stack>
                </Grid>
              )}
            </>
          );
        })}
        <Grid item xs={12} className="grid-item-groups-line">
          <div className="line"></div>
        </Grid>
        {activeGroupId !== -1 && (
          <Grid item xs={12} className="grid-item-groups-games">
            <MyCollectionGroupsGames
              activeGroupId={activeGroupId}
              groups={groups}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default MyCollectionGroups;
