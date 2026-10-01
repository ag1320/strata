import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, Paper, TextField, Button, Typography, Alert } from "@mui/material";
import { AppContext } from "../AppContext.js";
import { login } from "../helper-functions/serverCalls.js";
import logo from "../images/strata-logo.png";
import "../styling/Login.css";

export default function Login() {
  const { authStatus, setAuthStatus, setUsername } = useContext(AppContext);
  const [usernameInput, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  if (authStatus === "authenticated") {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameInput || !password) return;

    setLoggingIn(true);
    setLoginError(null);
    try {
      const data = await login(usernameInput, password);
      setUsername(data.username);
      setAuthStatus("authenticated");
    } catch (err) {
      setLoginError(err.response?.data?.error || "Login failed");
      setAuthStatus("unauthenticated");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <Box className="login-container">
      <Paper elevation={3} className="login-paper">
        <Box className="login-logo-container">
          <img src={logo} alt="Strata Games" className="login-logo" />
        </Box>
        <Typography variant="h6" align="center" gutterBottom>
          Sign in to Strata Games
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            autoFocus
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            autoComplete="username"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {loginError && (
            <Alert severity="error" className="login-error">
              {loginError}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            className="login-submit"
            disabled={loggingIn}
          >
            {loggingIn ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
