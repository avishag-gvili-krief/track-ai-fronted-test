import React, { useContext, useEffect, useMemo, useState } from "react";
import { Container, Box, Card, Typography, Grid } from "@mui/material";
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams, 
  GridRowParams,
  GridRowId,
  GridRowsProp
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
import { showEventIconHandler } from "../component/TrackingDetails";

interface DashboardProps {
  isCompact: boolean;
  onRowSelected?: (containerId: string | null) => void;
}

interface TrackingEvent {
  id: string;
  description?: string;
  location?: string;
  vessel?: { name?: string };
  vesselName?: string;
  voyage?: string;
  plannedAt?: string;
  actualAt?: string;
  timeInfo?: string;
  icon?: { imgSrc: string; imgAlt: string };
  parentId?: string;
  isDetailRow?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isCompact, onRowSelected }) => {
  const { user } = useContext(AuthContext);
  const { userPhones, fetchUserPhones } = useSmsContext();
  const { filterShipmentsByMultipleFields, winwordData } = useWinwordContext();

  const [filterOpen, setFilterOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [combinedRows, setCombinedRows] = useState<GridRowsProp>([]);

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
  
  useEffect(() => {
    if (winwordData?.data?.trackedShipments?.data) {
      setShipments(winwordData.data.trackedShipments.data);
    } 
    else if (user?.winwordData?.data?.trackedShipments?.data) {
      setShipments(user.winwordData.data.trackedShipments.data);
    }
  }, [winwordData, user]);
  
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
      selectedInsights: [],
      selectedStatuses,
    });
  }, [rows, selectedCompanies, searchText, selectedInsights, selectedStatuses]);
  
  // Generate tracking details rows when a row is expanded
  useEffect(() => {
    if (!expandedRowId) {
      setCombinedRows(filteredRows);
      return;
    }
  
    const expandedRow = filteredRows.find(row => row.id === expandedRowId);
    if (!expandedRow) {
      setCombinedRows(filteredRows);
      return;
    }
    
    // Create header row for the tracking details
    const headerRow = {
      id: `${expandedRowId}-header`,
      shipmentId: `${expandedRowId}-header`, // Add all required fields from columns
      description: "Status",
      location: "Location",
      vesselName: "Vessel",
      voyage: "Voyage",
      timeInfo: "Planned / Actual At",
      icon: { imgSrc: "", imgAlt: "Icon" },
      parentId: expandedRowId,
      isDetailRow: true,
    };
    
    // Make sure to map all necessary fields that DataGrid columns expect
    const createDetailRow = (event: any, index: number) => {
      const { imgSrc, imgAlt } = showEventIconHandler(event);
      
      // Create a base object with all properties from the parent row
      const baseDetailRow = { ...expandedRow };
      
      // Override with detail row specific properties
      return {
        ...baseDetailRow, // Include all fields from parent row to satisfy column requirements
        id: `${expandedRowId}-detail-${index}`,
        shipmentId: `${expandedRowId}-detail-${index}`, // Required for columns
        description: event.description || 'N/A',
        location: event.location || 'N/A',
        vesselName: (event.vessel && event.vessel.name) || event.vesselName || 'N/A',
        vessel: (event.vessel && event.vessel.name) || event.vesselName || 'N/A', // Support both field names
        voyage: event.voyage || 'N/A',
        timeInfo: `${event.plannedAt || 'N/A'} / ${event.actualAt || 'N/A'}`,
        plannedAt: event.plannedAt || 'N/A',
        actualAt: event.actualAt || 'N/A',
        icon: { imgSrc, imgAlt },
        parentId: expandedRowId,
        isDetailRow: true
      };
    };
    
    // Access the events array correctly
    const trackingEvents = expandedRow.events || [];
    
    // Create detail rows for each tracking event
    let detailRows = [];
    
    if (Array.isArray(trackingEvents) && trackingEvents.length > 0) {
      detailRows = trackingEvents.map((event, index) => createDetailRow(event, index));
    } else {
      // No events? Add a "no data" row
      detailRows = [{
        ...expandedRow, // Include all fields from parent row
        id: `${expandedRowId}-no-data`,
        shipmentId: `${expandedRowId}-no-data`,
        description: "No tracking events available",
        location: "",
        vesselName: "",
        vessel: "", // Support both field names
        voyage: "",
        timeInfo: "",
        plannedAt: "",
        actualAt: "",
        icon: { imgSrc: "", imgAlt: "" },
        parentId: expandedRowId,
        isDetailRow: true,
      }];
    }
    
    // Create a fully populated header row based on parent row
    const fullHeaderRow = {
      ...expandedRow, // Include all fields from parent row
      ...headerRow, // Override with header specific fields
    };
    
    // Insert the detail rows after the expanded row
    const newRows = [...filteredRows];
    const expandedRowIndex = newRows.findIndex(row => row.id === expandedRowId);
    
    if (expandedRowIndex !== -1) {
      newRows.splice(expandedRowIndex + 1, 0, fullHeaderRow, ...detailRows);
    }
    console.log("newRows",newRows);
    
    setCombinedRows(newRows);
  }, [filteredRows, expandedRowId]);

  const shipmentStats = useMemo(() => calculateShipmentStats(filteredRows), [filteredRows]);

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
      }
      else if (typeof opt.values === "string") {
        fields.push(opt.field);
        values.push(opt.values);
      }
      else if (opt.ranges) {
        console.warn("Range filters not supported yet in multi-filter GET");
      }
    });
  
    const customerCodes = user.activeCustomers.map((c: { customerNumber: { toString: () => any; }; }) => c.customerNumber.toString());
  
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
  const columns = baseColumns.map(col => ({
    ...col,
    renderCell: (params: GridRenderCellParams) => {
      // If this is a detail row, render the tracking details cell
      if (params.row.isDetailRow) {

        // console.log(params.row);
        // console.log(col);
        
        
        if (col.field === 'description') {
          return <Typography fontWeight={params.id.toString().endsWith('-header') ? 'bold' : 'normal'}>{params.row.description}</Typography>;
        }
        if (col.field === 'bol') {
          return <Typography fontWeight={params.id.toString().endsWith('-header') ? 'bold' : 'normal'}>{params.id.toString().endsWith('-header') ? "description" : params.row.events[+params.id.toString().split("-")[2]].description }</Typography>;
        }
        if (col.field === 'location') {
          return <Typography>{params.row.location}</Typography>;
        }
        if (col.field === 'vessel' || col.field === 'vesselName') {
          return <Typography>{params.row.vesselName || params.row.vessel}</Typography>;
        }
        if (col.field === 'voyage') {
          return <Typography>{params.row.voyage}</Typography>;
        }
        if (col.field === 'plannedAt' || col.field === 'actualAt' || col.field === 'timeInfo') {
          return <Typography>{params.row.timeInfo || `${params.row.plannedAt || 'N/A'} / ${params.row.actualAt || 'N/A'}`}</Typography>;
        }
        if (col.field === 'icon' && params.row.icon) {
          return params.row.icon.imgSrc ? (
            <img src={params.row.icon.imgSrc} alt={params.row.icon.imgAlt} width={24} />
          ) : (
            <Typography>—</Typography>
          );
        }
        // For other columns in detail rows, return empty content
        return <Typography>—</Typography>;
      }
      
      // For regular rows, use the original renderCell if available
      return col.renderCell ? col.renderCell(params) : params.value;
    }
  }));

  const handleRowClick = (params: GridRowParams) => {
    // Skip clicks on detail rows
    if (params.row.isDetailRow) {
      return;
    }

    const rowId = params.row.id;
    if (expandedRowId === rowId) {
      setExpandedRowId(null);
      onRowSelected?.(null);
    } else {
      setExpandedRowId(rowId);
      onRowSelected?.(params.row.id);
    }
  };

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

      <Box mt={3} >
        <DataGrid
          rows={combinedRows}
          columns={columns}
          pagination
          pageSizeOptions={[10, 25, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          onRowClick={handleRowClick}
          getRowClassName={(params) => {
            if (params.row.isDetailRow) {
              return params.id.toString().endsWith('-header') 
                ? 'detail-header-row'
                : 'detail-row';
            }
            return params.id === expandedRowId ? 'expanded-row' : '';
          }}
          sx={{
            minHeight: isCompact ? "50vh" : "70vh",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
            },
            "& .detail-row": {
              backgroundColor: "#f9f9f9",
              borderLeft: "4px solid #e0e0e0",
            },
            "& .detail-header-row": {
              backgroundColor: "#f5f5f5",
              borderLeft: "4px solid #e0e0e0",
              fontWeight: "bold",
            },
            "& .expanded-row": {
              backgroundColor: "#e8f4fd",
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