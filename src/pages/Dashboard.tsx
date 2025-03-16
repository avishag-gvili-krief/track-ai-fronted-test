import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Container,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  Paper,
  Box,
  LinearProgress,
  Radio,
  Checkbox,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { DataGrid } from "@mui/x-data-grid";

interface BusinessDataItem {
  key: string;
  value: string;
}

interface Metadata {
  businessData?: BusinessDataItem[];
}

interface Carrier {
  shortName?: string;
}

interface StatusEvent {
  description?: string;
  vessel?: { name?: string };
}

interface Status {
  pol?: { properties?: { locode?: string; name?: string } };
  pod?: { properties?: { locode?: string; name?: string } };
  currentEvent?: StatusEvent;
  actualDepartureAt?: string;
  estimatedDepartureAt?: string;
  actualArrivalAt?: string;
  estimatedArrivalAt?: string;
  predicted?: { datetime?: string; diffFromCarrierDays?: number };
  voyageStatus?: string;
  events?: StatusEvent[];
}

interface ShipmentData {
  id: string;
  containerNumber: string;
  bol: string | null;
  carrier?: Carrier;
  status?: Status;
  initialCarrierETA?: string;
  initialCarrierETD?: string;
}

interface TrackedShipment {
  id: string;
  metadata?: Metadata;
  shipment: ShipmentData;
}
const insightOptions = [
  "Arriving soon (1-3 days)",
  "Arrived",
  "Tracking completed",
  "Rollover at POL",
  "Rollover at TSP",
  "Late departure",
  "Transshipment delay",
  "Insufficient T/S time",
  "Routing deficiency",
  "Late allocation",
];

const statusOptions = [
  "On Time",
  "Early (1+ days)",
  "Significant delay (1-4 days)",
  "Critical delay (5+ days)",
];

const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();

export default function Dashboard() {
  const authContext = useContext(AuthContext);
  const [shipments, setShipments] = useState<TrackedShipment[]>([]);

  useEffect(() => {
    if (authContext?.user?.winwordData?.data?.trackedShipments?.data) {
      setShipments(authContext.user.winwordData.data.trackedShipments.data);
    }
  }, [authContext?.user]);

  const user = authContext?.user;
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`;
  const initials = getInitials(user?.firstName ?? "", user?.lastName ?? "");
  const companies = user?.activeCustomers ?? [];
  const companyNames = companies.map((company) => company.customerName);
  const [searchText, setSearchText] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const columns = useMemo(
    () => [
      { field: "containerNumber", headerName: "Container Number", width: 180 },
      { field: "bol", headerName: "BOL", width: 160 },
      { field: "carrier", headerName: "Latest Carrier", width: 140 },
      {
        field: "initialCarrierETD",
        headerName: "Initial Carrier ETD",
        width: 180,
      },
      {
        field: "latestCarrierETDOrATD",
        headerName: "Latest Carrier ETD/ATD",
        width: 180,
      },
      { field: "pol", headerName: "POL", width: 140 },
      { field: "path", headerName: "Path", width: 180 },
      { field: "pod", headerName: "POD", width: 140 },
      { field: "containerStatus", headerName: "Container Status", width: 220 },
      { field: "currentVessel", headerName: "Current Vessel", width: 180 },
      {
        field: "initialCarrierETA",
        headerName: "Initial Carrier ETA",
        width: 180,
      },
      {
        field: "latestCarrierETAOrATA",
        headerName: "Latest Carrier ETA/ATA",
        width: 180,
      },
      {
        field: "maritimeAiPredictedETA",
        headerName: "Maritime AI Predicted ETA",
        width: 200,
      },
      { field: "statusInsights", headerName: "Status & Insights", width: 220 },
      { field: "originCountry", headerName: "Origin Country", width: 180 },
      { field: "supplierName", headerName: "Supplier Name", width: 220 },
      {
        field: "consigneeAddress",
        headerName: "Consignee Address",
        width: 220,
      },
      {
        field: "customerReference",
        headerName: "Customer Reference",
        width: 200,
      },
    ],
    []
  );

  const handleFilterChange = (value: string, type: "insight" | "status") => {
    if (type === "insight") {
      setSelectedInsights((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      );
    } else {
      setSelectedStatuses((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      );
    }
  };

  const companyDisplay =
    companyNames.length > 2
      ? `${companyNames.slice(0, 2).join(", ")}...`
      : companyNames.join(", ");

  function escapeRegExp(value: string): string {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }

  const mapShipmentsToRows = (shipments: TrackedShipment[]) => {
    return shipments.map((tracked, index) => {
      const customerNumber =
        tracked.metadata?.businessData?.find(
          (item) => item.key === "Customer Code"
        )?.value || "N/A";

      return {
        id: tracked.shipment.id ?? index,
        containerNumber: tracked.shipment.containerNumber || "N/A",
        bol: tracked.shipment.bol || "N/A",
        carrier: tracked.shipment.carrier?.shortName || "N/A",

        // 🔹 "Initial Carrier ETD" - תאריך בפורמט קריא
        initialCarrierETD: tracked.shipment.initialCarrierETD
          ? new Date(tracked.shipment.initialCarrierETD).toLocaleString()
          : "N/A",

        // 🔹 "Latest Carrier ETD/ATD" - לקיחה כמו בקוד הראשון
        latestCarrierETDOrATD: tracked.shipment.status?.actualDepartureAt
          ? new Date(tracked.shipment.status.actualDepartureAt).toLocaleString()
          : tracked.shipment.status?.estimatedDepartureAt
          ? new Date(
              tracked.shipment.status.estimatedDepartureAt
            ).toLocaleString()
          : "N/A",

        pol: tracked.shipment.status?.pol?.properties?.locode || "N/A",
        pod: tracked.shipment.status?.pod?.properties?.locode || "N/A",
        path:
          tracked.shipment.status?.pol?.properties?.locode &&
          tracked.shipment.status?.pod?.properties?.locode
            ? `${tracked.shipment.status.pol.properties.locode} -> ${tracked.shipment.status.pod.properties.locode}`
            : "N/A",

        // 🔹 "Container Status" - תואם לקוד הראשון
        containerStatus:
          tracked.shipment.status?.currentEvent?.description ||
          (tracked.shipment.status?.events &&
          tracked.shipment.status.events.length > 0
            ? tracked.shipment.status.events[
                tracked.shipment.status.events.length - 1
              ]?.description || "Unknown"
            : "Unknown"),

        // 🔹 "Current Vessel" - לקיחה כמו בקוד הראשון
        currentVessel:
          tracked.shipment.status?.currentEvent?.vessel?.name ||
          (tracked.shipment.status?.events &&
          tracked.shipment.status.events.length > 0
            ? tracked.shipment.status.events[
                tracked.shipment.status.events.length - 1
              ]?.vessel?.name || "N/A"
            : "N/A"),

        initialCarrierETA: tracked.shipment.initialCarrierETA
          ? new Date(tracked.shipment.initialCarrierETA).toLocaleString()
          : "N/A",
        latestCarrierETAOrATA: tracked.shipment.status?.actualArrivalAt
          ? new Date(tracked.shipment.status.actualArrivalAt).toLocaleString()
          : tracked.shipment.status?.estimatedArrivalAt
          ? new Date(
              tracked.shipment.status.estimatedArrivalAt
            ).toLocaleString()
          : "N/A",

        maritimeAiPredictedETA: tracked.shipment.status?.predicted?.datetime
          ? new Date(
              tracked.shipment.status.predicted.datetime
            ).toLocaleString()
          : "N/A",

        // 🔹 "Origin Country" - מיפוי כמו בקוד הראשון
        originCountry:
          tracked.metadata?.businessData?.find(
            (item) => item.key.trim() === "Origin Country"
          )?.value || "N/A",

        supplierName:
          tracked.metadata?.businessData?.find(
            (item) => item.key === "Supplier Name"
          )?.value || "N/A",
        consigneeAddress:
          tracked.metadata?.businessData?.find(
            (item) => item.key === "Consignee Address"
          )?.value || "N/A",
        customerReference:
          tracked.metadata?.businessData?.find(
            (item) => item.key === "Customer Reference"
          )?.value || "N/A",

        customerNumber,

        statusInsights: (() => {
          const init = tracked.shipment.initialCarrierETA;
          const pred = tracked.shipment.status?.predicted?.datetime;
          const diffDays = diffCarrierDays(init, pred);
          if (diffDays === null) return "Unknown";

          if (diffDays === 0) {
            return "On Time";
          } else if (diffDays < 0) {
            return "Early (1+ days)";
          } else if (diffDays >= 1 && diffDays <= 4) {
            return "Significant delay (1-4 days)";
          } else if (diffDays >= 5) {
            return "Critical delay (5+ days)";
          }
          return "Unknown";
        })(),

        insights:
          tracked.shipment.status?.predicted?.diffFromCarrierDays ?? "N/A",

        differenceFromCarrierDays: tracked.shipment.status?.predicted
          ? tracked.shipment.status.predicted.diffFromCarrierDays
          : null,

        events: tracked.shipment.status?.events ?? [],

        voyageStatus: tracked.shipment.status?.voyageStatus ?? "N/A",
      };
    });
  };

  const requestSearch = (searchValue: string) => {
    setSearchText(searchValue);
  };

  const rows = useMemo(() => mapShipmentsToRows(shipments), [shipments]);

  const filteredRows = useMemo(() => {
    let filtered = rows;

    if (selectedCompanies.length > 0) {
      filtered = filtered.filter((row) =>
        selectedCompanies.includes(row.customerNumber)
      );
    }

    if (searchText) {
      const searchRegex = new RegExp(escapeRegExp(searchText), "i");
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          value ? searchRegex.test(value.toString()) : false
        )
      );
    }

    if (selectedInsights.length > 0) {
      filtered = filtered.filter((row) =>
        selectedInsights.includes(row.statusInsights)
      );
    }

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((row) =>
        selectedStatuses.includes(row.containerStatus)
      );
    }

    return filtered;
  }, [selectedCompanies, searchText, selectedInsights, selectedStatuses, rows]);

  function diffCarrierDays(
    initialETA: string | undefined,
    predictedETA: string | undefined
  ): number | null {
    if (!initialETA || !predictedETA) return null;
    const initial = new Date(initialETA);
    const predicted = new Date(predictedETA);

    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = Math.floor(
      (predicted.getTime() - initial.getTime()) / msPerDay
    );
    return diff;
  }

  let stats = {
    total: shipments.length,
    onTime: 0,
    early: 0,
    delayed: 0,
    critical: 0,
    completed: 0,
  };

  shipments.forEach((tracked) => {
    const status = tracked.shipment.status;
    if (status?.voyageStatus === "trackingCompleted") {
      stats.completed++;
      return;
    }

    const initial = tracked.shipment.initialCarrierETA;
    const predicted = status?.predicted?.datetime;
    const diffDays = diffCarrierDays(initial, predicted);

    if (diffDays === null) {
      return;
    } else if (diffDays === 0) {
      stats.onTime++;
    } else if (diffDays < 0) {
      stats.early++;
    } else if (diffDays >= 1 && diffDays <= 4) {
      stats.delayed++;
    } else if (diffDays >= 5) {
      stats.critical++;
    }
  });

  const shipmentStats = stats;

  const statusColors = {
    onTime: "#3b82f6",
    early: "#14b8a6",
    delayed: "#f59e0b",
    critical: "#ef4444",
    completed: "#22c55e",
  };

  const getPercentage = (value: number) =>
    shipmentStats.total ? (value / shipmentStats.total) * 100 : 0;

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      <AppBar
        position="static"
        sx={{ backgroundColor: "#1a237e", padding: "0.5rem" }}
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

      <Container maxWidth="xl">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ my: 2, px: 2 }}
        >
          <TextField
            variant="outlined"
            placeholder="Search in list"
            value={searchText}
            onChange={(event) => requestSearch(event.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "gray", mr: 1 }} />,
            }}
            sx={{ width: 250, bgcolor: "white", borderRadius: "4px" }}
          />

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterOpen((prev) => !prev)}
            sx={{
              mx: 1,
              bgcolor: "white",
              borderRadius: "8px",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Filter
          </Button>
          {filterOpen && (
            <Paper
              sx={{
                position: "absolute",
                top: "50px",
                right: "20px",
                zIndex: 1300,
                width: 260,
                bgcolor: "white",
                borderRadius: "8px",
                boxShadow: 3,
                p: 2,
                overflow: "auto",
                maxHeight: "400px",
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Insights
              </Typography>
              {insightOptions.map((insight) => (
                <MenuItem
                  key={insight}
                  onClick={() => handleFilterChange(insight, "insight")}
                >
                  <Checkbox checked={selectedInsights.includes(insight)} />
                  {insight}
                </MenuItem>
              ))}

              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ mt: 2, mb: 1 }}
              >
                Statuses
              </Typography>
              {statusOptions.map((status) => (
                <MenuItem
                  key={status}
                  onClick={() => handleFilterChange(status, "status")}
                >
                  <Checkbox checked={selectedStatuses.includes(status)} />
                  {status}
                </MenuItem>
              ))}

              <Button
                variant="contained"
                color="warning"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => setFilterOpen(false)}
              >
                Close
              </Button>
            </Paper>
          )}

          <Select
            multiple
            value={selectedCompanies}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedCompanies(
                typeof value === "string" ? value.split(",") : value
              );
            }}
            renderValue={(selected) =>
              selected.length === 0
                ? "Select Company"
                : companies
                    .filter((c) =>
                      selected.includes(c.customerNumber.toString())
                    )
                    .map((c) => c.customerName)
                    .join(", ")
            }
            sx={{ minWidth: 250, bgcolor: "white", borderRadius: "4px" }}
          >
            {companies.map((company) => (
              <MenuItem
                key={company.id}
                value={company.customerNumber.toString()}
              >
                <Checkbox
                  checked={selectedCompanies.includes(
                    company.customerNumber.toString()
                  )}
                />
                {company.customerName}
              </MenuItem>
            ))}
          </Select>

          {/* <Button
            variant="contained"
            sx={{
              ml: 1,
              bgcolor: "#1a237e",
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            GO
          </Button> */}

          <Button
            sx={{
              ml: 1,
              bgcolor: "orange",
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": { bgcolor: "#ff9800" },
            }}
          >
            <CloudDownloadIcon />
          </Button>
        </Box>

        <Card
          sx={{ p: 2, bgcolor: "white", borderRadius: "12px", boxShadow: 2 }}
        >
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                textAlign: "center",
                pr: 3,
                borderRight: "1px solid #e0e0e0",
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "#1e293b" }}
              >
                {shipmentStats.total}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Total Shipments
              </Typography>
            </Box>

            <Box sx={{ flex: 1, pl: 3 }}>
              {[
                {
                  label: "On Time",
                  value: shipmentStats.onTime,
                  color: statusColors.onTime,
                },
                {
                  label: "Early (1+ days)",
                  value: shipmentStats.early,
                  color: statusColors.early,
                },
                {
                  label: "Significant delay (1-4 days)",
                  value: shipmentStats.delayed,
                  color: statusColors.delayed,
                },
                {
                  label: "Critical delay (5+ days)",
                  value: shipmentStats.critical,
                  color: statusColors.critical,
                },
                {
                  label: "Tracking Completed",
                  value: shipmentStats.completed,
                  color: statusColors.completed,
                },
              ].map(({ label, value, color }) => (
                <Box key={label} display="flex" alignItems="center" mb={0.5}>
                  <Typography
                    variant="body2"
                    sx={{ width: 180, fontWeight: 600 }}
                  >
                    {label}
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      mx: 1,
                      backgroundColor: "#e5e7eb",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${getPercentage(value)}%`,
                        height: 8,
                        backgroundColor: color,
                        transition: "width 0.5s ease-in-out",
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Card>
        <br />
        <Paper sx={{ height: "70vh", width: "100%" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
          />
        </Paper>
      </Container>
    </Box>
  );
}
