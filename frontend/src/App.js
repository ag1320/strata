import Navbar from "./components/Navbar";
import Home from "./components/Home.js";
import MyCollectionTabBar from "./components/MyCollection/MyCollectionTabBar.js";
import Friends from "./components/Friends/Friends.js";
import Wishlist from "./components/Wishlist/Wishlist.js";
import AppSnackbar from "./components/AppSnackbar.js"
import Login from "./components/Login.js";
import RequireAuth from "./components/RequireAuth.js";

import logoText from "./images/strata-logo-and-text.png";
import logoFrame from "./images/strata-frame.png";

import { Box } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";

import "./styling/App.css";

const drawerWidth = 240;
const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: "100%",
    // Prevents any fixed-width child (a card grid, a carousel, a modal)
    // from stretching this container past the viewport and forcing a
    // horizontal scrollbar - a safety net on top of fixing each child.
    overflowX: "hidden",
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    // Below `sm` the Drawer is a "temporary" overlay (Navbar.js), not
    // "persistent" - it never pushes this content aside, so the push-over
    // width/margin above must never apply here regardless of `open`.
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginLeft: 0,
    },
  })
);

function App() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // /login is a standalone page - no Navbar/Drawer chrome, no auth check
  // (that would be circular). Everything else requires a session.
  if (location.pathname === "/login") {
    return <Login />;
  }

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
        <RequireAuth>
          <Main open={open}>
            <Routes>
              <Route path="/collection" element={<MyCollectionTabBar/>} />
              <Route path="/friends" element={<Friends/>}/>
              <Route path="/wishlist" element={<Wishlist/>}/>
              <Route path="/" element={<Home/>} />
            </Routes>
          </Main>
        </RequireAuth>
      </Box>
    </div>
  );
}

export default App;
