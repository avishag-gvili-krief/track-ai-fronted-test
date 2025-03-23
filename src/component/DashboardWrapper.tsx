import  { useState } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import DashboardPage from "../pages/Dashboard";

export default function DashboardWrapper() {
  const [isExpanded, setIsExpanded] = useState(false);


  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Box sx={{ position: "relative", height: "100vh", width: "100vw" }}>
      <Box
        sx={{
          position: "absolute",
          top: 0, 
          left: 0,
          width: "100%",
          height: "100%",
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
          top: 0,
          left: 0,
          width: isExpanded ? "100%" : "50%",
          height: "100%",
          transition: "width 0.3s ease-in-out",
          backgroundColor: "white",
          zIndex: 2,
        }}
      >
        <DashboardPage isCompact={!isExpanded} />
      </Box>
    </Box>
  );
}
