import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import CasinoIcon from "@mui/icons-material/Casino";
import logo from "../images/strata-logo.png";
import MeepleIcon from "../images/Meeple";
import "../styling/Navbar.css";
import bgg from "../images/BGG.jpeg";
import {
  Box,
  Toolbar,
  Typography,
  Button,
  Drawer,
  CssBaseline,
  List,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open, drawerWidth }) => ({
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
}));

export default function Navbar({
  drawerWidth,
  handleDrawerClose,
  handleDrawerOpen,
  open,
  theme,
}) {
  return (
    <Box sx={{ display: "flex", height: "7vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open}
        style={{ backgroundColor: "#2F4858", height: "7vh" }}
        drawerWidth={drawerWidth}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Link to="/">
            <Button color="inherit">
              <img src={logo} alt="" style={{ maxHeight: 50 }} />
            </Button>
          </Link>
          <Typography component={"span"} style={{ marginLeft: 20 }}>
            Let's get gaming!
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#2F4858",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <Link
            to="/"
            onClick={handleDrawerClose}
            style={{ textDecoration: "none", color: "white" }}
          >
            <ListItem button>
              <ListItemIcon>
                <HomeIcon style={{ fill: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
          </Link>
          <Link
            to="/collection"
            onClick={handleDrawerClose}
            style={{ textDecoration: "none", color: "white" }}
          >
            <ListItem button>
              <ListItemIcon>
                <CasinoIcon style={{ fill: "white" }} />
              </ListItemIcon>
              <ListItemText primary="My Collection" />
            </ListItem>
          </Link>
        </List>
        <Divider />
        <List>
          <Link
            to="/friends"
            onClick={handleDrawerClose}
            style={{ textDecoration: "none", color: "white" }}
          >
            <ListItem button>
              <ListItemIcon>
                <MeepleIcon />
              </ListItemIcon>
              <ListItemText primary="Friends" />
            </ListItem>
          </Link>
        </List>
        <Box className="bgg-container">
          <a
            href={"https://boardgamegeek.com/"}
            target="_blank"
            rel="noopener noreferrer"
            className="bgg-homepage-link"
          >
            <img
              src={bgg}
              alt="BoardGameGeek"
              className="bgg-homepage-graphic"
            />
          </a>
        </Box>
      </Drawer>
    </Box>
  );
}
