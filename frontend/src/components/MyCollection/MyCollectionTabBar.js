import PropTypes from "prop-types";
import MyCollection from "./MyCollection";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useContext, useState, useCallback } from "react";
import "../../styling/MyCollectionTabBar.css";
import MyCollectionGroups from "./MyCollectionGroups";
import GetMyCollection from "./GetMyCollection.js";
import GetPlayers from "./GetPlayers.js";
import GetPlaySessions from "./GetPlaySessions.js";
import MyCollectionPlays from "./MyCollectionPlays.js";
import MyCollectionStats from "./MyCollectionStats.js";
import LogPlayModal from "./LogPlayModal";
import { AppContext } from "../../AppContext.js";


const TabPanel = ({ children, tabValue, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={tabValue !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {tabValue === index && (
        <Box sx={{ p: 3 }}>
          <Typography component={"span"}>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  tabValue: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function MyCollectionTabBar() {
  const [tabValue, setTabValue] = useState(0);
  let {setDefaultGameForPlaysTab} = useContext(AppContext)

  const handleTabChange = (event, newValue) => {
    //if you navigate away from the plays tab, set default game to null
    if (newValue !== 2){
      setDefaultGameForPlaysTab(null)
    }
    setTabValue(newValue);
  };

  const [logPlaysState, setLogPlaysState] = useState({
    open: false,
    game: null,
  });
  const handleLogPlayModalClose = () => {
    setLogPlaysState({ open: false, game: null });
  };
  const handleLogPlayClick = useCallback((game = null) => {
    setLogPlaysState({ open: true, game });
  }, []);
  const handleSeePlays = useCallback((game) => {
    setDefaultGameForPlaysTab(game);
    setTabValue(2);
  }, [setDefaultGameForPlaysTab, setTabValue]);

  return (
    <>
      <LogPlayModal
        open={logPlaysState.open}
        handleClose={handleLogPlayModalClose}
        defaultSelectedGame={logPlaysState.game}
      />
      <GetMyCollection />
      <GetPlayers/>
      <GetPlaySessions/>
      <Box sx={{ width: "95%", margin: "auto" }}>
        <Box sx={{ borderBottom: 1, borderColor: "white" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="basic tabs example"
            textColor="primary"
            className="my-collection-tabs"
          >
            <Tab
              label={<span className="my-collection-tab">My Collection</span>}
              {...a11yProps(0)}
            />
            <Tab
              label={<span className="my-collection-tab">Groups</span>}
              {...a11yProps(1)}
            />
            <Tab
              label={<span className="my-collection-tab">Plays</span>}
              {...a11yProps(2)}
            />
            <Tab
              label={<span className="my-collection-tab">Stats</span>}
              {...a11yProps(3)}
            />
          </Tabs>
        </Box>
        <TabPanel
          tabValue={tabValue}
          index={0}
          className="my-collection-tab-panel"
        >
          <MyCollection handleLogPlayClick={handleLogPlayClick} handleSeePlays={handleSeePlays}/>
        </TabPanel>
        <TabPanel
          tabValue={tabValue}
          index={1}
          className="my-collection-tab-panel"
        >
          <MyCollectionGroups />
        </TabPanel>
        <TabPanel
          tabValue={tabValue}
          index={2}
          className="my-collection-tab-panel"
        >
          <MyCollectionPlays handleLogPlayClick={handleLogPlayClick} />
        </TabPanel>
        <TabPanel
          tabValue={tabValue}
          index={3}
          className="my-collection-tab-panel"
        >
          <MyCollectionStats handleSeePlays={handleSeePlays}/>
        </TabPanel>
      </Box>
    </>
  );
}
