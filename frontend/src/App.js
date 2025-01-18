import Navbar from "./components/Navbar";
import Home from "./components/Home.js";
import MyCollectionTabBar from "./components/MyCollection/MyCollectionTabBar.js";
import Friends from "./components/Friends/Friends.js"
import AppSnackbar from "./components/AppSnackbar.js"

import logoText from "./images/strata-logo-and-text.png";
import logoFrame from "./images/strata-frame.png";

import { Box } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import "./styling/App.css";

const drawerWidth = 240;
const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  })
);

function App() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className="App">
      <Box className="App-logo-container">
        <img src={logoText} className="App-logo-text" alt="logo-text" />
        <img src={logoFrame} className="App-logo-frame" alt="logo-frame" />
      </Box>
      <Box className="content-container">
        <Navbar
          drawerWidth={drawerWidth}
          handleDrawerClose={handleDrawerClose}
          handleDrawerOpen={handleDrawerOpen}
          open={open}
          theme={theme}
        />
        <AppSnackbar/>
        <Main open={open}>
          <Routes>
            <Route path="/collection" element={<MyCollectionTabBar/>} />
            <Route path="/friends" element={<Friends/>}/>
            <Route path="/" element={<Home/>} />
          </Routes>
        </Main>
      </Box>
    </div>
  );
}

export default App;
