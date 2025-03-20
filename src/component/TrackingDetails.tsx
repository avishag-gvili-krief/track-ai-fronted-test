// TrackingDetails.tsx
import React from "react";
import { Box } from "@mui/material";

interface Event {
  description?: string;
  location?: string;
  vessel?: { name?: string };
  voyage?: string;
  plannedAt?: string;
  actualAt?: string;
}

const showEventIconHandler = (eventRecord: Event) => {
  let imgAttr = { imgSrc: "", imgAlt: "" };
  if (eventRecord.description === "Empty to shipper") {
    imgAttr.imgSrc = "/Empty_to_shipper.png";
    imgAttr.imgAlt = "Empty_to_shipper";
  } else if (eventRecord.description === "Gate in at first POL") {
    // ...
  }
  // ...  icon mapping ...
  return imgAttr;
};

export default function TrackingDetails(
    {
  rowData,
}: {
  rowData: any; 
}) 
{
    console.log("TrackingDetails",rowData)
  const events: Event[] = rowData.events || [];
  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        border: "1px solid #ccc",
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
      }}
    >
      <h4>Container Tracking for {rowData.containerNumber}</h4>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Status</th>
            <th style={{ textAlign: "left" }}>Location</th>
            <th style={{ textAlign: "left" }}>Vessel</th>
            <th style={{ textAlign: "left" }}>Voyage</th>
            <th style={{ textAlign: "left" }}>Planned / Actual At</th>
            <th style={{ textAlign: "left" }}>Icon</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => {
            const { imgSrc, imgAlt } = showEventIconHandler(event);
            return (
              <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
                <td>{event.description || "N/A"}</td>
                <td>{event.location || "N/A"}</td>
                <td>{event.vessel?.name || "N/A"}</td>
                <td>{event.voyage || "N/A"}</td>
                <td>
                  {event.plannedAt || "N/A"} / {event.actualAt || "N/A"}
                </td>
                <td>
                  {imgSrc ? (
                    <img src={imgSrc} alt={imgAlt} width={24} />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
}
