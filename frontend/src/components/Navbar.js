import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import CasinoIcon from "@mui/icons-material/Casino";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../images/strata-logo.png";
import MeepleIcon from "../images/Meeple";
import "../styling/Navbar.css";
import bgg from "../images/BGG.jpeg";
import { AppContext } from "../AppContext.js";
import { logout } from "../helper-functions/serverCalls.js";
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
  useMediaQuery,
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
  // Below `sm`, the Drawer becomes a "temporary" overlay (see the variant
  // switch below) instead of "persistent" - an overlay sits on top of the
  // page, it doesn't push it aside, so the bar must never shrink/shift for
  // it regardless of `open`. Placed after the `open` spread so this wins on
  // mobile widths.
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    marginLeft: 0,
  },
}));

export default function Navbar({
  drawerWidth,
  handleDrawerClose,
  handleDrawerOpen,
  open,
  theme,
}) {
  const navigate = useNavigate();
  const { setAuthStatus, setUsername } = useContext(AppContext);
  // "persistent" pushes the main content aside, leaving room for the
  // drawer - fine on desktop, but on a phone-width screen that's most of
  // the viewport gone permanently. Below `sm`, switch to "temporary": an
  // overlay that sits on top of the page and dismisses on a backdrop tap
  // or (already wired up below) any nav link tap, never stealing layout
  // width. This is MUI's own documented responsive-drawer pattern.
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setAuthStatus("unauthenticated");
      setUsername(null);
      navigate("/login");
    }
  };

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
            maxWidth: "80vw",
            boxSizing: "border-box",
            backgroundColor: "#2F4858",
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        ModalProps={{ keepMounted: true }}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
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
          <Link
            to="/wishlist"
            onClick={handleDrawerClose}
            style={{ textDecoration: "none", color: "white" }}
          >
            <ListItem button>
              <ListItemIcon>
                <BookmarkIcon style={{ fill: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Wishlist" />
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
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon style={{ fill: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Log out" />
          </ListItem>
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
