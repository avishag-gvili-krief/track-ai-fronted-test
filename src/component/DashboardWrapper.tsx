import React, { useState, useContext } from "react";
import { Box, IconButton, AppBar, Toolbar, Typography, Avatar } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import Dashboard from "../pages/Dashboard";
import { AuthContext } from "../context/AuthContext";

export default function DashboardWrapper() {
  const [isExpanded, setIsExpanded] = useState(false);
  const authContext = useContext(AuthContext);

  const user = authContext?.user;
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`;
  const initials = `${user?.firstName?.charAt(0) ?? ""}${user?.lastName?.charAt(0) ?? ""}`.toUpperCase();
  const companies = user?.activeCustomers ?? [];
  const companyNames = companies.map((company) => company.customerName);
  const companyDisplay =
    companyNames.length > 2 ? `${companyNames.slice(0, 2).join(", ")}...` : companyNames.join(", ");

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Box sx={{ position: "relative", height: "100vh", width: "100vw" }}>
      <AppBar
        position="fixed" 
        sx={{ backgroundColor: "#1a237e", height: "80px", zIndex: 100 }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            <img
              src="../../public/Krief-white-logo.png"
              alt="Logo"
              style={{ height: 40, marginRight: 10 }}
            />
          </Typography>
          <Typography sx={{ mr: 2 }}>
            {fullName} <br />
            <Typography variant="caption">{companyDisplay}</Typography>
          </Typography>
          <Avatar sx={{ bgcolor: "orange", ml: 2 }}>{initials}</Avatar>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          position: "absolute",
          top: 60,
          left: 0,
          width: "100%",
          height: "calc(100% - 60px)",
          backgroundColor: "#f0f0f0",
          zIndex: 1,
        }}
      />

      <IconButton
        onClick={toggleExpand}
        sx={{
          position: "absolute",
          left: isExpanded ? "calc(100% - 50px)" : "calc(50% - 25px)",
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "white",
          boxShadow: 2,
          zIndex: 3,
          borderRadius: "50%",
        }}
      >
        {isExpanded ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>

      <Box
        sx={{
          position: "absolute",
          top: 60,
          left: 0,
          width: isExpanded ? "100%" : "50%",
          height: "calc(100% - 60px)",
          transition: "width 0.3s ease-in-out",
          backgroundColor: "white",
          zIndex: 2,
        }}
      >
        <Dashboard isCompact={!isExpanded} />
      </Box>
    </Box>
  );
}
