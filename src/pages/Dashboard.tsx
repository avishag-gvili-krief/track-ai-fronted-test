import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Container, Box, Card, Typography } from "@mui/material";
import {
  DataGrid,
  GridRenderCellParams,
  GridRowParams,
  GridRowsProp,
} from "@mui/x-data-grid";
import { exportToExcel } from "../utils/exportToExcel";
import { AuthContext } from "../context/AuthContext";
import { useSmsContext } from "../context/SmsContext";
import { useShipmentFilters } from "../hooks/useShipmentFilters";
import { mapShipmentsToRows } from "../mappers/mapShipmentsToRows";
import ShipmentStats from "../component/ShipmentStats";
import { calculateShipmentStats } from "../utils/statisticsUtils";
import { useShipmentColumns } from "../hooks/useShipmentColumns";
import { statusColors } from "../constants/colors";
import TrackDialog from "../component/TrackDialog";
import { useWinwordContext } from "../context/WinwordContext";
import { insightOptions } from "../constants/filters";
import DashboardToolbar from "../component/DashboardToolbar";
import { filterShipments } from "../utils/filterUtils";
import { showEventIconHandler } from "../utils/showEventIconHandler";
import { formatDate } from "../utils/shipmentUtils";
import { KeyboardArrowDown } from "@mui/icons-material";

interface DashboardProps {
  isCompact: boolean;
  onRowSelected?: (containerId: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ isCompact, onRowSelected }) => {
  const { user } = useContext(AuthContext);
  const { userPhones, fetchUserPhones } = useSmsContext();
  const { filterShipmentsByMultipleFields, winwordData } = useWinwordContext();
  const [filterOpen, setFilterOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(
    null
  );
  const [shipments, setShipments] = useState<any[]>([]);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const {
    searchText,
    requestSearch,
    selectedCompanies,
    setSelectedCompanies,
    pendingInsights,
    selectedInsights,
    selectedStatuses,
    handlePendingFilterChange,
    applyPendingFilters,
  } = useShipmentFilters();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    if (winwordData?.data?.trackedShipments?.data) {
      setShipments(winwordData.data.trackedShipments.data);
    } else if (user?.winwordData?.data?.trackedShipments?.data) {
      setShipments(user.winwordData.data.trackedShipments.data);
    }
  }, [winwordData, user]);

  useEffect(() => {
    if (user?.id) fetchUserPhones(user.id);
  }, [user?.id]);

  useEffect(() => {
    setExpandedRowId(null);
  }, [paginationModel.page]);

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
      selectedInsights: [],
      selectedStatuses,
    });
  }, [rows, selectedCompanies, searchText, selectedInsights, selectedStatuses]);

  const visibleRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filteredRows.slice(start, end);
  }, [filteredRows, paginationModel]);

  // Generate tracking details rows when a row is expanded
  const combinedRows = useMemo(() => {
    const rowsWithDetails: any[] = [];

    visibleRows.forEach((row) => {
      rowsWithDetails.push(row);

      if (row.id === expandedRowId) {
        const headerRow = {
          id: `${row.id}-header`,
          shipmentId: `${row.id}-header`,
          description: "Status",
          location: "Location",
          vesselName: "Vessel",
          voyage: "Voyage",
          timeInfo: "Planned / Actual At",
          icon: { imgSrc: "", imgAlt: "Icon" },
          parentId: row.id,
          isDetailRow: true,
        };

        const createDetailRow = (event: any, index: number) => {
          const { imgSrc, imgAlt } = showEventIconHandler(event);
          const isCurrentEvent = index === row.currentEventIndex;

          return {
            ...row,
            id: `${row.id}-detail-${index}`,
            shipmentId: `${row.id}-detail-${index}`,
            description: event.description || "N/A",
            location: event.port?.properties?.name || "N/A",
            vesselName: event.vessel?.name || "N/A",
            vessel: event.vessel?.name || "N/A",
            voyage: event.voyage || "N/A",
            timeInfo: formatDate(event.timestamps?.datetime),
            icon: { imgSrc, imgAlt },
            parentId: row.id,
            isDetailRow: true,
            isCurrentEvent,
            isAfterCurrentEvent: index > row.currentEventIndex,
          };
        };

        const trackingEvents = row?.events || [];
        const detailRows =
          Array.isArray(trackingEvents) && trackingEvents.length > 0
            ? trackingEvents.map((event, index) =>
                createDetailRow(event, index)
              )
            : [
                {
                  ...row,
                  id: `${row.id}-no-data`,
                  shipmentId: `${row.id}-no-data`,
                  description: "No tracking events available",
                  location: "",
                  vesselName: "",
                  vessel: "",
                  voyage: "",
                  timeInfo: "",
                  icon: { imgSrc: "", imgAlt: "" },
                  parentId: row.id,
                  isDetailRow: true,
                },
              ];

        rowsWithDetails.push(headerRow, ...detailRows);
      }
    });

    return rowsWithDetails;
  }, [visibleRows, expandedRowId]);

  const shipmentStats = useMemo(
    () => calculateShipmentStats(filteredRows),
    [filteredRows]
  );

  const handleDownloadExcel = () => {
    exportToExcel(columns, filteredRows, "ShipmentsData.xlsx");
  };

  const handleApplyFilters = () => {
    applyPendingFilters();

    const selectedFilters = insightOptions.filter((i) =>
      pendingInsights.includes(i.title)
    );

    if (!selectedFilters.length) {
      if (user?.winwordData?.data?.trackedShipments?.data) {
        setShipments(user.winwordData.data.trackedShipments.data);
      }
      setFilterOpen(false);
      return;
    }

    if (!user?.activeCustomers) return;

    const fields: string[] = [];
    const values: string[] = [];

    selectedFilters.forEach((opt) => {
      if (Array.isArray(opt.values)) {
        opt.values.forEach((val: string) => {
          fields.push(opt.field);
          values.push(val);
        });
      } else if (typeof opt.values === "string") {
        fields.push(opt.field);
        values.push(opt.values);
      } else if (opt.ranges) {
        console.warn("Range filters not supported yet in multi-filter GET");
      }
    });

    const customerCodes = user.activeCustomers.map(
      (c: { customerNumber: { toString: () => any } }) =>
        c.customerNumber.toString()
    );

    filterShipmentsByMultipleFields(fields, values, customerCodes);
    setFilterOpen(false);
  };

  // Get the base columns from your hook
  const baseColumns = useShipmentColumns(
    isCompact,
    user?.id || "",
    userPhones,
    (id) => setSelectedContainerId(id),
    setDialogOpen
  );

  // Apply custom renderers to handle detail rows
  const columns = baseColumns.map((col) => ({
    ...col,
    renderCell: (params: GridRenderCellParams) => {
      if (params.row.isDetailRow) {
        if (
          col.field === "containerNumber" ||
          (isCompact && col.field === "containerInfo")
        ) {
          return (
            <Box display="flex" alignItems="left" gap={1}>
              {params.row.icon?.imgSrc && (
                <img
                  src={params.row.icon.imgSrc}
                  alt={params.row.icon.imgAlt}
                  width={24}
                />
              )}
              <Typography
                fontSize="13px"
                sx={{ textAlign: "left", width: "100%" }}
              >
                {params.row.description}
              </Typography>
            </Box>
          );
        }
        if (
          col.field === "carrier" ||
          (isCompact && col.field === "latestCarrierETAOrATA")
        ) {
          const alwaysShowLocation =
            params.id.toString().endsWith("-header") ||
            params.row.id.includes("-detail-0") || // first row
            combinedRows
              .filter(
                (r) =>
                  r.parentId === params.row.parentId &&
                  r.isDetailRow &&
                  !r.id.endsWith("header")
              )
              .slice(-1)[0]?.id === params.row.id; // last row

          const isArrival = params.row.description
            ?.toLowerCase()
            .includes("arrival");

          return (
            <Typography
              fontSize="13px"
              sx={{ textAlign: "left", width: "100%" }}
            >
              {alwaysShowLocation || isArrival ? (
                params.row.location
              ) : (
                <KeyboardArrowDown fontSize="small" />
              )}
            </Typography>
          );
        }

        if (col.field === "initialCarrierETD") {
          return (
            <Typography
              fontSize="13px"
              sx={{ textAlign: "left", width: "100%" }}
            >
              {params.row.vesselName || params.row.vessel}
            </Typography>
          );
        }
        if (col.field === "latestCarrierETDOrATD") {
          return (
            <Typography
              fontSize="13px"
              sx={{ textAlign: "left", width: "100%" }}
            >
              {params.row.voyage}
            </Typography>
          );
        }
        if (
          col.field === "pol" ||
          (isCompact && col.field === "maritimeAiPredictedETA")
        ) {
          return (
            <Typography
              fontSize="13px"
              sx={{ textAlign: "left", width: "100%" }}
            >
              {params.row.timeInfo}
            </Typography>
          );
        }
        return <Typography></Typography>;
      }
      return col.renderCell ? col.renderCell(params) : params.value;
    },
  }));

  const handleRowClick = (params: GridRowParams) => {
    if (params.row.isDetailRow) return;

    const rowId = params.row.id;
    if (expandedRowId === rowId) {
      setExpandedRowId(null);
      onRowSelected?.(null);
    } else {
      setExpandedRowId(rowId);
      onRowSelected?.(params.row.id);
    }
  };
  const currentPageContainsExpandedRow = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    const visibleIds = filteredRows.slice(start, end).map((row) => row.id);
    return expandedRowId ? visibleIds.includes(expandedRowId) : false;
  }, [filteredRows, paginationModel, expandedRowId]);
  
  useEffect(() => {
    if (!currentPageContainsExpandedRow) {
      setExpandedRowId(null);
    }
  }, [paginationModel.page, currentPageContainsExpandedRow]);
  return (
    <Container maxWidth="xl">
      <DashboardToolbar
        searchText={searchText}
        requestSearch={requestSearch}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        selectedCompanies={selectedCompanies}
        setSelectedCompanies={setSelectedCompanies}
        pendingInsights={pendingInsights}
        pendingStatuses={selectedStatuses}
        handlePendingFilterChange={handlePendingFilterChange}
        handleDownloadExcel={handleDownloadExcel}
        companies={user?.activeCustomers || []}
        onApplyFilters={handleApplyFilters}
      />

      <Card sx={{ p: 2, bgcolor: "white", borderRadius: "12px", boxShadow: 4 }}>
        <ShipmentStats stats={shipmentStats} statusColors={statusColors} />
      </Card>

      <Box
        mt={3}
        ref={gridContainerRef}
        sx={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <DataGrid
          rows={combinedRows}
          columns={columns}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 100]}
          rowCount={filteredRows.length}
          onRowClick={handleRowClick}
          getRowClassName={(params) => {
            if (params.row.isDetailRow) {
              let base = params.id.toString().endsWith("-header")
                ? "detail-header-row"
                : "detail-row";

              if (params.row.isCurrentEvent) base += " current-event";
              else if (params.row.isAfterCurrentEvent) base += " faded-row";

              const siblings = combinedRows.filter(
                (r) =>
                  r.parentId === params.row.parentId &&
                  r.isDetailRow &&
                  !r.id.endsWith("header")
              );
              const index = siblings.findIndex((r) => r.id === params.row.id);
              if (index === 0) base += " first-event";
              if (index === siblings.length - 1) base += " last-event";

              return base;
            }
            return params.id === expandedRowId ? "expanded-row" : "";
          }}
          sx={{
            "& .detail-row .MuiTypography-root": {
              fontSize: "13px",
            },
            "& .detail-header-row .MuiTypography-root": {
              fontWeight: "bold",
              fontSize: "13px",
              textAlign: "center",
            },
            minHeight: isCompact ? "50vh" : "70vh",
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f0f0f0",
              fontWeight: "bold",
              borderBottom: "2px solid #ddd",
            },
            "& .MuiDataGrid-row": {
              borderBottom: "none !important",
              borderTop: "none !important",
              border: "none !important",
            },
            "& .detail-row .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
            "& .detail-row.current-event .MuiTypography-root": {
              fontWeight: "bold",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(30, 136, 229, 0.08)",
            },
            "& .detail-row": {
              backgroundColor: "#fffdf8",
              position: "relative",
              paddingLeft: "30px",
            },
            "& .detail-row::before": {
              content: '""',
              position: "absolute",
              left: "15px",
              top: "0",
              height: "100%",
              width: "2px",
              backgroundColor: "#1e88e5",
            },

            "& .detail-row.first-event::before": {
              top: "50%",
            },

            "& .detail-row.last-event::before": {
              height: "50%",
            },
            "& .detail-header-row::after": {
              display: "none",
            },
            "& .detail-header-row::before": {
              display: "none",
            },

            "& .detail-header-row": {
              backgroundColor: "#f5f5f5",
              borderLeft: "4px solidrgb(0, 67, 126)",
              fontWeight: "bold",
              position: "relative",
            },
            "& .faded-row .MuiTypography-root": {
              color: "#9e9e9e",
            },
            "& .expanded-row": {
              backgroundColor: "#e3f2fd",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none !important",
              borderTop: "none !important",
              textAlign: "left",
            },

            "& .detail-row:not(.detail-header-row)::after": {
              content: '""',
              position: "absolute",
              left: "11px",
              top: "18px",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#1e88e5",
              zIndex: 1,
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              textAlign: "center",
              width: "100%",
            },
            "@keyframes blink": {
              "0%": { opacity: 1 },
              "50%": { opacity: 0.3 },
              "100%": { opacity: 1 },
            },
            "& .detail-row.current-event::after": {
              backgroundColor: "#ff9800",
              animation: "blink 1.5s infinite",
              borderRadius: "50%",
              width: "10px",
              height: "10px",
              position: "absolute",
              left: "11px",
              top: "18px",
              content: '""',
            },
            "& .detail-row.current-event": {
              backgroundColor: "#fff3e0",
            },
            "& .MuiDataGrid-columnHeader": {
              justifyContent: "center",
            },
          }}
          getRowHeight={(params) => {
            return params.model.isDetailRow ? 45 : 52;
          }}
          isRowSelectable={(params) => !params.row.isDetailRow}
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
