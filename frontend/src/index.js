import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import AppProvider from "./AppContext";
import { StyledEngineProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import React Query
import "./styling/index.css";

const queryClient = new QueryClient();
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

// Render application
root.render(
  <StyledEngineProvider injectFirst>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppProvider>
        <Router>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </Router>
      </AppProvider>
    </LocalizationProvider>
  </StyledEngineProvider>
);
