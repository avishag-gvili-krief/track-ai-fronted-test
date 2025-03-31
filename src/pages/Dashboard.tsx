import React, { useContext, useEffect, useMemo, useState } from "react";
import { Container, Box, Card } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { exportToExcel } from "../utils/exportToExcel";
import { AuthContext } from "../context/AuthContext";
import { useSmsContext } from "../context/SmsContext";
import { useShipmentFilters } from "../hooks/useShipmentFilters";
import { mapShipmentsToRows } from "../mappers/mapShipmentsToRows";
import ShipmentStats from "../component/ShipmentStats";
import { calculateShipmentStats } from "../utils/statisticsUtils";
import { filterShipments } from "../utils/filterUtils";
import DashboardToolbar from "../component/DashboardToolbar";
import { useShipmentColumns } from "../hooks/useShipmentColumns";
import { statusColors } from "../constants/colors";
import TrackDialog from "../component/TrackDialog";

interface DashboardProps {
  isCompact: boolean;
  onRowSelected?: (containerId: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ isCompact, onRowSelected }) => {
  console.log("deshbord");

  const { user } = useContext(AuthContext);
  const { userPhones, fetchUserPhones } = useSmsContext();
  const [filterOpen, setFilterOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(
    null
  );
  const [shipments, setShipments] = useState<any[]>([]);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const {
    searchText,
    requestSearch,
    selectedCompanies,
    setSelectedCompanies,
    selectedInsights,
    selectedStatuses,
    handleFilterChange,
  } = useShipmentFilters();

  useEffect(() => {
    if (user?.winwordData?.data?.trackedShipments?.data) {
      setShipments(user.winwordData.data.trackedShipments.data);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) fetchUserPhones(user.id);
  }, [user?.id]);

  const rows = useMemo(() => {
    return mapShipmentsToRows(shipments, user?.id || "").map((row) => ({
      ...row,
      shipmentId: row.id || "",
    }));
  }, [shipments, user]);

  const filteredRows = useMemo(() => {
    return filterShipments(rows, {
      selectedCompanies,
      searchText,
      selectedInsights,
      selectedStatuses,
    });
  }, [rows, selectedCompanies, searchText, selectedInsights, selectedStatuses]);

  const shipmentStats = useMemo(
    () => calculateShipmentStats(filteredRows),
    [filteredRows]
  );

  const handleDownloadExcel = () => {
    exportToExcel(columns, filteredRows, "ShipmentsData.xlsx");
  };

  const columns = useShipmentColumns(
    isCompact,
    user?.id || "",
    userPhones,
    (id) => setSelectedContainerId(id),
    setDialogOpen
  );

  return (
    <Container maxWidth="xl">
      <DashboardToolbar
        searchText={searchText}
        requestSearch={requestSearch}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        selectedCompanies={selectedCompanies}
        setSelectedCompanies={setSelectedCompanies}
        selectedInsights={selectedInsights}
        selectedStatuses={selectedStatuses}
        handleFilterChange={handleFilterChange}
        handleDownloadExcel={handleDownloadExcel}
        companies={user?.activeCustomers || []}
      />

      <Card sx={{ p: 2, bgcolor: "white", borderRadius: "12px", boxShadow: 2 }}>
        <ShipmentStats stats={shipmentStats} statusColors={statusColors} />
      </Card>

      <Box mt={3}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pagination
          pageSizeOptions={[10, 25, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          onRowClick={(params) => {
            const rowId = params.row.id;
            if (expandedRowId === rowId) {
              setExpandedRowId(null);
              onRowSelected?.(null);
            } else {
              setExpandedRowId(rowId);
              onRowSelected?.(params.row.id);
            }
          }}
          sx={{
            minHeight: isCompact ? "50vh" : "70vh",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
            },
          }}
        />
        {selectedContainerId && (
          <TrackDialog
            key={selectedContainerId}
            open={dialogOpen}
            onClose={() => {
              setDialogOpen(false);
              setSelectedContainerId(null);
            }}
            containerId={selectedContainerId}
            userId={user?.id ?? ""}
            existingEntry={userPhones.find(
              (entry) => entry.container === selectedContainerId
            )}
            refresh={() => {
              if (user?.id) fetchUserPhones(user.id);
            }}
          />
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;
