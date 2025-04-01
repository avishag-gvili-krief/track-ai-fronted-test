import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LoadingOverlay from "./component/LoadingOverlay";
import AppProviders from "./context/AppProviders";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
      <LoadingOverlay />
    </AppProviders>
  </React.StrictMode>
);
