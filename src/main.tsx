import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CompanyProvider } from "./context/CompanyContext";
import { UserProvider } from "./context/UserContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <CompanyProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </CompanyProvider>
    </AuthProvider>
  </React.StrictMode>
);
