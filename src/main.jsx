import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";
import { HeaderVisibilityProvider } from "./contexts/HeaderVisibilityContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <HeaderVisibilityProvider>
        <App />
      </HeaderVisibilityProvider>
    </AuthProvider>
  </React.StrictMode>
);
