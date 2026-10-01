import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { AppContext } from "../AppContext";
import { fetchCurrentUser } from "../helper-functions/serverCalls";

// Gates everything except /login. On first mount (fresh page load, or a
// deep link) authStatus is "unknown" - ask the API whether the session
// cookie is still valid before deciding to render children or bounce to
// /login, so a valid session doesn't flash the login screen.
export default function RequireAuth({ children }) {
  const { authStatus, setAuthStatus, setUsername } = useContext(AppContext);

  useEffect(() => {
    if (authStatus === "unknown") {
      fetchCurrentUser()
        .then((data) => {
          setUsername(data.username);
          setAuthStatus("authenticated");
        })
        .catch(() => {
          setAuthStatus("unauthenticated");
        });
    }
  }, [authStatus, setAuthStatus, setUsername]);

  if (authStatus === "unknown") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (authStatus === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
