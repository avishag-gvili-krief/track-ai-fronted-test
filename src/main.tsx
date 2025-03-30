import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CompanyProvider } from "./context/CompanyContext";
import { UserProvider } from "./context/UserContext";
import { SmsProvider } from "./context/SmsContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <CompanyProvider>
        <UserProvider>
          <SmsProvider>
            <App />
          </SmsProvider>
        </UserProvider>
      </CompanyProvider>
    </AuthProvider>
  </React.StrictMode>
);
