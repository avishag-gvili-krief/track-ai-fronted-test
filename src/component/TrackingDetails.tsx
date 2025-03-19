import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";

interface Event {
  id?: string | number;
  description?: string | null;
  location?: string | null;
  vessel?: { name?: string | null } | null;
  voyage?: string | null;
  plannedAt?: string | null;
  actualAt?: string | null;
}

const showEventIconHandler = (description?: string | null) => {
  const icons: Record<string, string> = {
    "Empty to shipper": "/Empty_to_shipper.png",
    "Gate in at first POL": "/Gate_in_POL.png",
  };
  return icons[description || ""] || "";
};

export default function TrackingDetails({ rowData }: { rowData: { events?: Event[] | null } }) {
  const eventsWithIds = rowData.events?.map((event, index) => ({
    id: event.id ?? index, // Ensure each row has an ID
    description: event.description ?? "N/A",
    location: event.location ?? "N/A",
    vessel: event.vessel?.name ?? "N/A",
    voyage: event.voyage ?? "N/A",
    plannedAt: event.plannedAt ?? "N/A",
    actualAt: event.actualAt ?? "N/A",
  })) ?? [];

  const columns = [
    { field: "description", headerName: "Status", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
    { field: "vessel", headerName: "Vessel", flex: 1 },
    { field: "voyage", headerName: "Voyage", flex: 1 },
    { field: "plannedAt", headerName: "Planned At", flex: 1 },
    { field: "actualAt", headerName: "Actual At", flex: 1 },
    {
      field: "icon",
      headerName: "Icon",
      flex: 1,
      renderCell: (params) => {
        const imgSrc = showEventIconHandler(params.row.description);
        return imgSrc ? <img src={imgSrc} alt="icon" width={24} /> : "—";
      },
    },
  ];

  return (
    <Box sx={{ height: 400, width: "100%", mt: 2 }}>
      <DataGrid
        rows={eventsWithIds}
        columns={columns}
        autoPageSize
        disableRowSelectionOnClick
      />
    </Box>
  );
}
