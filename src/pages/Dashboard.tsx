// import React, { useContext, useEffect, useMemo, useState } from "react";
// import { AuthContext } from "../context/AuthContext";
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Avatar,
//   Container,
//   Card,
//   CardContent,
//   Grid,
//   TextField,
//   Button,
//   Select,
//   MenuItem,
//   Paper,
//   Box,
//   LinearProgress,
//   Radio,
//   Checkbox,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
// import { DataGrid } from "@mui/x-data-grid";
// import { format } from "date-fns";
// import { hasFlag } from "country-flag-icons";
// import Flags from "country-flag-icons/react/3x2";
// import {
//   fetchPhoneNumbers,
//   createPhoneNumber,
//   updatePhoneNumber,
// } from "../api/containerService";
// import TrackingDetails from "../component/TrackingDetails";

// const formatDate = (dateString: string | undefined) => {
//   if (!dateString) return "N/A";

//   const date = new Date(dateString);
//   if (isNaN(date.getTime())) return "N/A";

//   return format(date, "dd MMM'’'yy h:mm a");
// };

// interface BusinessDataItem {
//   key: string;
//   value: string;
// }

// interface Metadata {
//   businessData?: BusinessDataItem[];
// }

// interface Carrier {
//   shortName?: string;
// }

// interface StatusEvent {
//   description?: string;
//   vessel?: { name?: string };
// }

// interface Status {
//   pol?: { properties?: { locode?: string; name?: string } };
//   pod?: { properties?: { locode?: string; name?: string } };
//   currentEvent?: StatusEvent;
//   actualDepartureAt?: string;
//   estimatedDepartureAt?: string;
//   actualArrivalAt?: string;
//   estimatedArrivalAt?: string;
//   predicted?: { datetime?: string; diffFromCarrierDays?: number };
//   voyageStatus?: string;
//   events?: StatusEvent[];
// }

// interface ShipmentData {
//   id: string;
//   containerNumber: string;
//   bol: string | null;
//   carrier?: Carrier;
//   status?: Status;
//   initialCarrierETA?: string;
//   initialCarrierETD?: string;
// }

// interface TrackedShipment {
//   id: string;
//   metadata?: Metadata;
//   shipment: ShipmentData;
// }

// const insightOptions = [
//   "Arriving soon (1-3 days)",
//   "Arrived",
//   "Tracking completed",
//   "Rollover at POL",
//   "Rollover at TSP",
//   "Late departure",
//   "Transshipment delay",
//   "Insufficient T/S time",
//   "Routing deficiency",
//   "Late allocation",
// ];

// const statusOptions = [
//   "On Time",
//   "Early (1+ days)",
//   "Significant delay (1-4 days)",
//   "Critical delay (5+ days)",
// ];

// const getInitials = (firstName: string, lastName: string) =>
//   `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();

// export default function Dashboard() {
//   const authContext = useContext(AuthContext);
//   const [shipments, setShipments] = useState<TrackedShipment[]>([]);
//   const [phoneNumbers, setPhoneNumbers] = useState<{
//     [key: string]: { phone: string; shipmentId: string };
//   }>({});
//   const [localPhoneNumbers, setLocalPhoneNumbers] = useState<{
//     [key: string]: string;
//   }>({});
//   const [phoneIds, setPhoneIds] = useState<{ [key: string]: string }>({});
//   // Replace single expanded row state with an array to allow for expandable rows
//   const [expandedRows, setExpandedRows] = useState<string[]>([]);

//   useEffect(() => {
//     if (authContext?.user?.winwordData?.data?.trackedShipments?.data) {
//       setShipments(authContext.user.winwordData.data.trackedShipments.data);
//     }
//   }, [authContext?.user]);

//   useEffect(() => {
//     const loadPhoneNumbers = async () => {
//       const containerIds = shipments.map((s) => s.shipment.containerNumber);
//       const data = await fetchPhoneNumbers(containerIds);
//       setPhoneNumbers(data);
//       setLocalPhoneNumbers(
//         Object.keys(data).reduce((acc, container) => {
//           acc[container] = data[container]?.phone || "";
//           return acc;
//         }, {} as { [key: string]: string })
//       );
//     };

//     loadPhoneNumbers();
//   }, [shipments]);

//   const handleInputChange = (containerNumber: string, value: string) => {
//     setLocalPhoneNumbers((prev) => ({
//       ...prev,
//       [containerNumber]: value,
//     }));
//   };

//   const handleSave = async (containerNumber: string, shipmentId: string) => {
//     const newPhone = localPhoneNumbers[containerNumber];

//     if (!newPhone || !shipmentId) return;

//     await createPhoneNumber(containerNumber, newPhone, shipmentId);

//     setPhoneNumbers((prev) => ({
//       ...prev,
//       [containerNumber]: { phone: newPhone, shipmentId },
//     }));
//   };

//   const handleUpdate = async (containerNumber: string) => {
//     const newPhone = localPhoneNumbers[containerNumber];
//     const id = phoneIds[containerNumber];
//     const shipmentId = phoneNumbers[containerNumber]?.shipmentId || "";

//     if (!newPhone || !id || !shipmentId) return;

//     await updatePhoneNumber(id, containerNumber, newPhone, shipmentId);

//     setPhoneNumbers((prev) => ({
//       ...prev,
//       [containerNumber]: { phone: newPhone, shipmentId },
//     }));
//   };

//   const user = authContext?.user;
//   const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`;
//   const initials = getInitials(user?.firstName ?? "", user?.lastName ?? "");
//   const companies = user?.activeCustomers ?? [];
//   const companyNames = companies.map((company) => company.customerName);
//   const [searchText, setSearchText] = useState("");
//   const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
//   const [selectedInsights, setSelectedInsights] = useState<string[]>([]);
//   const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
//   const [filterOpen, setFilterOpen] = useState(false);

//   // Original columns definition
//   const columns = useMemo(
//     () => [
//       { field: "containerNumber", headerName: "Container Number", width: 180 },
//       { field: "bol", headerName: "BOL", width: 160 },
//       { field: "carrier", headerName: "Latest Carrier", width: 140 },
//       {
//         field: "initialCarrierETD",
//         headerName: "Initial Carrier ETD",
//         width: 180,
//       },
//       {
//         field: "latestCarrierETDOrATD",
//         headerName: "Latest Carrier ETD/ATD",
//         width: 180,
//       },
//       {
//         field: "pol",
//         headerName: "POL",
//         width: 200,
//         renderCell: (params: any) => params.value || "N/A",
//       },
//       {
//         field: "pod",
//         headerName: "POD",
//         width: 200,
//         renderCell: (params: any) => params.value || "N/A",
//       },
//       {
//         field: "path",
//         headerName: "Path",
//         width: 250,
//         renderCell: (params: any) => (
//           <div
//             style={{
//               width: "100%",
//               display: "flex",
//               alignItems: "center",
//               gap: "10px",
//             }}
//           >
//             <span style={{ fontWeight: "bold" }}>
//               {params.value.pol} → {params.value.pod}
//             </span>
//             <LinearProgress
//               variant="determinate"
//               value={params.value.progress}
//               sx={{ flexGrow: 1, height: "10px", borderRadius: "5px" }}
//             />
//             <span style={{ fontSize: "12px", fontWeight: "bold" }}>
//               {Math.round(params.value.progress)}%
//             </span>
//           </div>
//         ),
//       },
//       { field: "containerStatus", headerName: "Container Status", width: 220 },
//       { field: "currentVessel", headerName: "Current Vessel", width: 180 },
//       {
//         field: "initialCarrierETA",
//         headerName: "Initial Carrier ETA",
//         width: 180,
//       },
//       {
//         field: "latestCarrierETAOrATA",
//         headerName: "Latest Carrier ETA/ATA",
//         width: 200,
//         renderCell: (params: any) =>
//           formatEtaWithColor(params.value, params.row.statusInsights),
//       },
//       {
//         field: "maritimeAiPredictedETA",
//         headerName: "Maritime AI Predicted ETA",
//         width: 200,
//       },
//       {
//         field: "statusInsights",
//         headerName: "Status & Insights",
//         width: 220,
//         renderCell: (params: any) => formatStatusInsights(params.value),
//       },
//       { field: "originCountry", headerName: "Origin Country", width: 180 },
//       { field: "supplierName", headerName: "Supplier Name", width: 220 },
//       {
//         field: "consigneeAddress",
//         headerName: "Consignee Address",
//         width: 220,
//       },
//       {
//         field: "customerReference",
//         headerName: "Customer Reference",
//         width: 200,
//       },
//       {
//         field: "phoneNumber",
//         headerName: "Phone Number",
//         width: 300,
//         renderCell: (params: any) => {
//           const containerNumber = params.row.containerNumber;
//           const shipmentId = params.row.shipmentId;
//           const currentPhone = phoneNumbers[containerNumber]?.phone || "";
//           const editedPhone =
//             localPhoneNumbers[containerNumber] ?? currentPhone;

//           return (
//             <Box display="flex" gap={1} alignItems="center">
//               <TextField
//                 variant="outlined"
//                 size="small"
//                 value={editedPhone}
//                 onChange={(e) =>
//                   handleInputChange(containerNumber, e.target.value)
//                 }
//                 sx={{ width: "140px" }}
//               />
//               {currentPhone ? (
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   onClick={() => handleUpdate(containerNumber)}
//                   disabled={!localPhoneNumbers[containerNumber]}
//                 >
//                   Update
//                 </Button>
//               ) : (
//                 <Button
//                   variant="contained"
//                   color="success"
//                   onClick={() => handleSave(containerNumber, shipmentId)}
//                   disabled={!localPhoneNumbers[containerNumber]}
//                 >
//                   Save
//                 </Button>
//               )}
//             </Box>
//           );
//         },
//       },
//     ],
//     // Note: dependency array is kept empty as columns do not depend on changing state here
//     []
//   );

//   // Helper functions (formatStatusInsights, getFlag, getPortWithFlag, formatEtaWithColor, diffCarrierDays) remain unchanged

//   const formatStatusInsights = (value: string) => {
//     if (!value || value === "N/A" || value === "Unknown") {
//       return <span style={{ color: "#999", fontSize: "13px" }}>N/A</span>;
//     }

//     let color = "#3b82f6";
//     let sign = "";
//     let label = "as initial ETA";
//     let displayValue = "On Time";

//     if (value.includes("Early")) {
//       color = "#14b8a6";
//       sign = "-";
//       displayValue = `${value.replace(/\D/g, "")}d early`;
//       label = "from initial ETA";
//     } else if (value.includes("Significant delay")) {
//       color = "#e67e22";
//       sign = "+";
//       displayValue = `${value.replace(/\D/g, "")}d late`;
//       label = "from initial ETA";
//     } else if (value.includes("Critical delay")) {
//       color = "#ef4444";
//       sign = "+";
//       displayValue = `${value.replace(/\D/g, "")}d late`;
//       label = "from initial ETA";
//     } else if (value.includes("Tracking Completed")) {
//       color = "#22c55e";
//       displayValue = "Tracking Completed";
//       label = "";
//     }

//     return (
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "left",
//           textAlign: "left",
//           lineHeight: "1.2",
//           padding: "4px 0",
//         }}
//       >
//         <span style={{ color, fontWeight: "bold", fontSize: "14px" }}>
//           {sign}
//           {displayValue}
//         </span>
//         {label && (
//           <span style={{ color: "#888", fontSize: "12px" }}>{label}</span>
//         )}
//       </div>
//     );
//   };

//   const getFlag = (locode = "") => {
//     if (!locode) return null;

//     const countryCode = locode.slice(0, 2).toUpperCase();
//     const exist = hasFlag(countryCode);
//     const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

//     if (!exist) {
//       return null;
//     } else {
//       const countryName = regionNames.of(countryCode);
//       const FlagComponent = Flags[countryCode];

//       return FlagComponent ? (
//         <FlagComponent
//           title={countryName}
//           style={{
//             width: "20px",
//             height: "14px",
//             display: "inline-block",
//             marginRight: "4px",
//             verticalAlign: "middle",
//             borderRadius: "2px",
//             boxShadow: "0 0 2px rgba(0, 0, 0, 0.2)",
//           }}
//         />
//       ) : null;
//     }
//   };

//   const getPortWithFlag = (
//     locode: string | undefined,
//     name: string | undefined
//   ) => {
//     if (!locode || !name) return "N/A";

//     return (
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           alignItems: "center",
//           gap: "6px",
//           textAlign: "left",
//           padding: "3px 0",
//         }}
//       >
//         {getFlag(locode)}
//         <span style={{ fontSize: "13px", fontWeight: "bold" }}>{name}</span>
//         <span style={{ fontSize: "11px", color: "#666" }}>{locode}</span>
//       </div>
//     );
//   };

//   const formatEtaWithColor = (
//     dateString: string | undefined,
//     status: string
//   ) => {
//     const formattedDate = formatDate(dateString);
//     if (formattedDate === "N/A")
//       return <span style={{ color: "#999" }}>N/A</span>;

//     let color = "#3b82f6";
//     if (status.includes("Early")) color = "#14b8a6";
//     else if (status.includes("Significant delay")) color = "#e67e22";
//     else if (status.includes("Critical delay")) color = "#ef4444";
//     else if (status.includes("Tracking Completed")) color = "#22c55e";

//     return (
//       <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//         <span
//           style={{
//             width: "8px",
//             height: "8px",
//             backgroundColor: color,
//             borderRadius: "50%",
//             display: "inline-block",
//           }}
//         />
//         <span>{formattedDate}</span>
//       </div>
//     );
//   };

//   function diffCarrierDays(
//     initialETA: string | undefined,
//     predictedETA: string | undefined
//   ): number | null {
//     if (!initialETA || !predictedETA) return null;
//     const initial = new Date(initialETA);
//     const predicted = new Date(predictedETA);

//     const msPerDay = 24 * 60 * 60 * 1000;
//     const diff = Math.floor(
//       (predicted.getTime() - initial.getTime()) / msPerDay
//     );
//     return diff;
//   }

//   const mapShipmentsToRows = (shipments: TrackedShipment[]) => {
//     return shipments.map((tracked, index) => {
//       const podPort =
//         tracked.metadata?.businessData?.find(
//           (item) => item.key === "Discharge Port"
//         )?.value || "N/A";

//       const customerNumber =
//         tracked.metadata?.businessData?.find(
//           (item) => item.key === "Customer Code"
//         )?.value || "N/A";

//       return {
//         id: tracked.shipment.id ?? index,
//         containerNumber: tracked.shipment.containerNumber || "N/A",
//         bol: tracked.shipment.bol || "N/A",
//         carrier: tracked.shipment.carrier?.shortName || "N/A",
//         initialCarrierETD: tracked.shipment.initialCarrierETD
//           ? formatDate(tracked.shipment.initialCarrierETD).toLocaleString()
//           : "N/A",
//         latestCarrierETDOrATD: tracked.shipment.status?.actualDepartureAt
//           ? formatDate(tracked.shipment.status.actualDepartureAt).toLocaleString()
//           : tracked.shipment.status?.estimatedDepartureAt
//           ? formatDate(tracked.shipment.status.estimatedDepartureAt).toLocaleString()
//           : "N/A",
//         pol: tracked.shipment.status?.pol
//           ? getPortWithFlag(
//               tracked.shipment.status.pol.properties?.locode,
//               tracked.shipment.status.pol.properties?.name
//             )
//           : "N/A",
//         pod: tracked.shipment.status?.pod
//           ? getPortWithFlag(
//               tracked.shipment.status.pod.properties?.locode,
//               podPort
//             )
//           : "N/A",
//         path: {
//           pol: tracked.shipment.status?.pol?.properties?.locode || "N/A",
//           pod: tracked.shipment.status?.pod?.properties?.locode || "N/A",
//           progress: getPathProgress(tracked.shipment),
//         },
//         containerStatus:
//           tracked.shipment.status?.currentEvent?.description ||
//           (tracked.shipment.status?.events &&
//           tracked.shipment.status.events.length > 0
//             ? tracked.shipment.status.events[
//                 tracked.shipment.status.events.length - 1
//               ]?.description || "Unknown"
//             : "Unknown"),
//         currentVessel:
//           tracked.shipment.status?.currentEvent?.vessel?.name ||
//           (tracked.shipment.status?.events &&
//           tracked.shipment.status.events.length > 0
//             ? tracked.shipment.status.events[
//                 tracked.shipment.status.events.length - 1
//               ]?.vessel?.name || "N/A"
//             : "N/A"),
//         initialCarrierETA: tracked.shipment.initialCarrierETA
//           ? formatDate(tracked.shipment.initialCarrierETA).toLocaleString()
//           : "N/A",
//         latestCarrierETAOrATA: tracked.shipment.status?.actualArrivalAt
//           ? formatDate(tracked.shipment.status.actualArrivalAt).toLocaleString()
//           : tracked.shipment.status?.estimatedArrivalAt
//           ? formatDate(tracked.shipment.status.estimatedArrivalAt).toLocaleString()
//           : "N/A",
//         maritimeAiPredictedETA: tracked.shipment.status?.predicted?.datetime
//           ? formatDate(tracked.shipment.status.predicted.datetime).toLocaleString()
//           : "N/A",
//         originCountry:
//           tracked.metadata?.businessData?.find(
//             (item) => item.key.trim() === "Origin Country"
//           )?.value || "N/A",
//         supplierName:
//           tracked.metadata?.businessData?.find(
//             (item) => item.key === "Supplier Name"
//           )?.value || "N/A",
//         consigneeAddress:
//           tracked.metadata?.businessData?.find(
//             (item) => item.key === "Consignee Address"
//           )?.value || "N/A",
//         customerReference:
//           tracked.metadata?.businessData?.find(
//             (item) => item.key === "Customer Reference"
//           )?.value || "N/A",
//         customerNumber,
//         statusInsights: (() => {
//           const init = tracked.shipment.initialCarrierETA;
//           const pred = tracked.shipment.status?.predicted?.datetime;
//           const diffDays = diffCarrierDays(init, pred);

//           if (tracked.shipment.status?.voyageStatus === "trackingCompleted") {
//             return "Tracking Completed";
//           }

//           if (diffDays === null) return "N/A";

//           if (diffDays === 0) {
//             return "On Time";
//           } else if (diffDays < 0) {
//             return `Early (${Math.abs(diffDays)}+ days)`;
//           } else if (diffDays >= 1 && diffDays <= 4) {
//             return `Significant delay (${diffDays} days)`;
//           } else if (diffDays >= 5) {
//             return `Critical delay (${diffDays}+ days)`;
//           }
//           return "Unknown";
//         })(),
//         insights:
//           tracked.shipment.status?.predicted?.diffFromCarrierDays ?? "N/A",
//         differenceFromCarrierDays: tracked.shipment.status?.predicted
//           ? tracked.shipment.status.predicted.diffFromCarrierDays
//           : null,
//         events: tracked.shipment.status?.events ?? [],
//         voyageStatus: tracked.shipment.status?.voyageStatus ?? "N/A",
//       };
//     });
//   };

//   // This function calculates the progress percentage for the shipment path.
//   const getPathProgress = (shipment: any) => {
//     if (
//       !shipment.status ||
//       !shipment.initialCarrierETA ||
//       !shipment.status.predicted?.datetime
//     ) {
//       return 0;
//     }

//     const shipmentStart = new Date(
//       shipment.status.actualDepartureAt || shipment.status.estimatedDepartureAt
//     );
//     const shipmentEnd = new Date(
//       shipment.status.predicted.datetime || shipment.status.actualArrivalAt
//     );
//     const now = new Date();

//     if (shipmentStart >= shipmentEnd) return 100;

//     const totalDuration = shipmentEnd.getTime() - shipmentStart.getTime();
//     const elapsedDuration = now.getTime() - shipmentStart.getTime();
//     return Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
//   };

//   const rows = useMemo(() => {
//     return mapShipmentsToRows(shipments).map((row) => ({
//       ...row,
//       shipmentId: row.id || "",
//       phoneNumber: phoneNumbers[row.containerNumber]?.phone || "",
//     }));
//   }, [shipments, phoneNumbers]);

//   // Compute filtered rows based on search and filter options
//   const filteredRows = useMemo(() => {
//     let filtered = rows;

//     if (selectedCompanies.length > 0) {
//       filtered = filtered.filter((row) =>
//         selectedCompanies.includes(row.customerNumber)
//       );
//     }

//     if (searchText) {
//       const searchRegex = new RegExp(escapeRegExp(searchText), "i");
//       filtered = filtered.filter((row) =>
//         Object.values(row).some((value) =>
//           value ? searchRegex.test(value.toString()) : false
//         )
//       );
//     }

//     if (selectedInsights.length > 0) {
//       filtered = filtered.filter((row) =>
//         selectedInsights.includes(row.statusInsights)
//       );
//     }

//     if (selectedStatuses.length > 0) {
//       filtered = filtered.filter((row) =>
//         selectedStatuses.includes(row.containerStatus)
//       );
//     }

//     return filtered;
//   }, [selectedCompanies, searchText, selectedInsights, selectedStatuses, rows]);

//   function escapeRegExp(value: string): string {
//     return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
//   }

//   // Create a flattened rows array that injects a sub-row (for tracking details)
//   // immediately after its parent row when that row is expanded.
//   const flattenedRows = useMemo(() => {
//     let flat: any[] = [];
//     filteredRows.forEach((row) => {
//       flat.push(row);
//       if (expandedRows.includes(row.id)) {
//         flat.push({
//           id: `${row.id}-sub`,
//           isSubRow: true,
//           parentId: row.id,
//           rowData: row,
//         });
//       }
//     });
//     return flat;
//   }, [filteredRows, expandedRows]);

//   const mergedColumns = useMemo(
//     () =>
//       columns.map((col) => {
//         const originalRenderCell = col.renderCell;

//         if (col.field === "containerNumber") {
//           return {
//             ...col,
//             renderCell: (params: any) => {
//               if (params?.row?.isSubRow) {
//                 return (
//                   <div style={{ gridColumn: "1 / -1", width: "100%" }}>
//                     <TrackingDetails rowData={params.row.rowData} />
//                   </div>
//                 );
//               }
//               return originalRenderCell ? originalRenderCell(params) : params.value;
//             },
//             // Remove colSpan if it doesn't work in your setup
//           };
//         }

//         return {
//           ...col,
//           renderCell: (params: any) => {
//             if (params?.row?.isSubRow) {
//               return null;
//             }
//             return originalRenderCell ? originalRenderCell(params) : params.value;
//           },
//         };
//       }),
//     [columns]
//   );

//   // Toggle expansion of a parent row by adding or removing its id from expandedRows.
//   const handleRowClick = (params: any) => {
//     if (params.row?.isSubRow) return;
//     const rowId = params.row.id;
//     setExpandedRows((prev) =>
//       prev.includes(rowId)
//         ? prev.filter((id) => id !== rowId)
//         : [...prev, rowId]
//     );
//   };

//   // Calculate shipment statistics based on filtered rows.
//   const shipmentStats = useMemo(() => {
//     let stats = {
//       total: filteredRows.length,
//       onTime: 0,
//       early: 0,
//       delayed: 0,
//       critical: 0,
//       completed: 0,
//     };

//     filteredRows.forEach((row) => {
//       const status = row.statusInsights;

//       if (status === "Tracking Completed") {
//         stats.completed++;
//       } else if (status.includes("On Time")) {
//         stats.onTime++;
//       } else if (status.includes("Early")) {
//         stats.early++;
//       } else if (status.includes("Significant delay")) {
//         stats.delayed++;
//       } else if (status.includes("Critical delay")) {
//         stats.critical++;
//       }
//     });

//     return stats;
//   }, [filteredRows]);

//   const statusColors = {
//     onTime: "#3b82f6",
//     early: "#14b8a6",
//     delayed: "#f59e0b",
//     critical: "#ef4444",
//     completed: "#22c55e",
//   };

//   const getPercentage = (value: number) =>
//     shipmentStats.total ? (value / shipmentStats.total) * 100 : 0;

//   return (
//     <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh" }}>
//       <AppBar
//         position="static"
//         sx={{ backgroundColor: "#1a237e", padding: "0.5rem" }}
//       >
//         <Toolbar>
//           <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
//             <img
//               src="../../public/Krief-white-logo.png"
//               alt="Logo"
//               style={{ height: 40, marginRight: 10 }}
//             />
//           </Typography>
//           <Typography sx={{ mr: 2 }}>
//             {fullName} <br />
//             <Typography variant="caption">{companyNames.length > 2
//               ? `${companyNames.slice(0, 2).join(", ")}...`
//               : companyNames.join(", ")}</Typography>
//           </Typography>
//           <Avatar sx={{ bgcolor: "orange", ml: 2 }}>{initials}</Avatar>
//         </Toolbar>
//       </AppBar>

//       <Container maxWidth="xl">
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="space-between"
//           sx={{ my: 2, px: 2 }}
//         >
//           <TextField
//             variant="outlined"
//             placeholder="Search in list"
//             value={searchText}
//             onChange={(event) => setSearchText(event.target.value)}
//             InputProps={{
//               startAdornment: <SearchIcon sx={{ color: "gray", mr: 1 }} />,
//             }}
//             sx={{ width: 250, bgcolor: "white", borderRadius: "4px" }}
//           />

//           <Button
//             variant="outlined"
//             startIcon={<FilterListIcon />}
//             onClick={() => setFilterOpen((prev) => !prev)}
//             sx={{
//               mx: 1,
//               bgcolor: "white",
//               borderRadius: "8px",
//               fontWeight: 600,
//               textTransform: "none",
//             }}
//           >
//             Filter
//           </Button>
//           {filterOpen && (
//             <Paper
//               sx={{
//                 position: "absolute",
//                 top: "50px",
//                 right: "20px",
//                 zIndex: 1300,
//                 width: 260,
//                 bgcolor: "white",
//                 borderRadius: "8px",
//                 boxShadow: 3,
//                 p: 2,
//                 overflow: "auto",
//                 maxHeight: "400px",
//               }}
//             >
//               <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
//                 Insights
//               </Typography>
//               {insightOptions.map((insight) => (
//                 <MenuItem
//                   key={insight}
//                   onClick={() =>
//                     setSelectedInsights((prev) =>
//                       prev.includes(insight)
//                         ? prev.filter((item) => item !== insight)
//                         : [...prev, insight]
//                     )
//                   }
//                 >
//                   <Checkbox checked={selectedInsights.includes(insight)} />
//                   {insight}
//                 </MenuItem>
//               ))}

//               <Typography
//                 variant="subtitle1"
//                 fontWeight="bold"
//                 sx={{ mt: 2, mb: 1 }}
//               >
//                 Statuses
//               </Typography>
//               {statusOptions.map((status) => (
//                 <MenuItem
//                   key={status}
//                   onClick={() =>
//                     setSelectedStatuses((prev) =>
//                       prev.includes(status)
//                         ? prev.filter((item) => item !== status)
//                         : [...prev, status]
//                     )
//                   }
//                 >
//                   <Checkbox checked={selectedStatuses.includes(status)} />
//                   {status}
//                 </MenuItem>
//               ))}

//               <Button
//                 variant="contained"
//                 color="warning"
//                 fullWidth
//                 sx={{ mt: 2 }}
//                 onClick={() => setFilterOpen(false)}
//               >
//                 Close
//               </Button>
//             </Paper>
//           )}

//           <Select
//             multiple
//             value={selectedCompanies}
//             onChange={(event) => {
//               const value = event.target.value;
//               setSelectedCompanies(
//                 typeof value === "string" ? value.split(",") : value
//               );
//             }}
//             renderValue={(selected) =>
//               selected.length === 0
//                 ? "Select Company"
//                 : companies
//                     .filter((c) =>
//                       selected.includes(c.customerNumber.toString())
//                     )
//                     .map((c) => c.customerName)
//                     .join(", ")
//             }
//             sx={{ minWidth: 250, bgcolor: "white", borderRadius: "4px" }}
//           >
//             {companies.map((company) => (
//               <MenuItem
//                 key={company.id}
//                 value={company.customerNumber.toString()}
//               >
//                 <Checkbox
//                   checked={selectedCompanies.includes(
//                     company.customerNumber.toString()
//                   )}
//                 />
//                 {company.customerName}
//               </MenuItem>
//             ))}
//           </Select>

//           <Button
//             sx={{
//               ml: 1,
//               bgcolor: "orange",
//               color: "white",
//               fontWeight: "bold",
//               textTransform: "none",
//               "&:hover": { bgcolor: "#ff9800" },
//             }}
//           >
//             <CloudDownloadIcon />
//           </Button>
//         </Box>

//         <Card
//           sx={{ p: 2, bgcolor: "white", borderRadius: "12px", boxShadow: 2 }}
//         >
//           <Box display="flex" alignItems="center">
//             <Box
//               sx={{
//                 textAlign: "center",
//                 pr: 3,
//                 borderRight: "1px solid #e0e0e0",
//               }}
//             >
//               <Typography
//                 variant="h4"
//                 sx={{ fontWeight: "bold", color: "#1e293b" }}
//               >
//                 {shipmentStats.total}
//               </Typography>
//               <Typography variant="subtitle2" color="textSecondary">
//                 Total Shipments
//               </Typography>
//             </Box>

//             <Box sx={{ flex: 1, pl: 3 }}>
//               {[
//                 {
//                   label: "On Time",
//                   value: shipmentStats.onTime,
//                   color: statusColors.onTime,
//                 },
//                 {
//                   label: "Early (1+ days)",
//                   value: shipmentStats.early,
//                   color: statusColors.early,
//                 },
//                 {
//                   label: "Significant delay (1-4 days)",
//                   value: shipmentStats.delayed,
//                   color: statusColors.delayed,
//                 },
//                 {
//                   label: "Critical delay (5+ days)",
//                   value: shipmentStats.critical,
//                   color: statusColors.critical,
//                 },
//                 {
//                   label: "Tracking Completed",
//                   value: shipmentStats.completed,
//                   color: statusColors.completed,
//                 },
//               ].map(({ label, value, color }) => (
//                 <Box key={label} display="flex" alignItems="center" mb={0.5}>
//                   <Typography
//                     variant="body2"
//                     sx={{ width: 180, fontWeight: 600 }}
//                   >
//                     {label}
//                   </Typography>
//                   <Box
//                     sx={{
//                       flex: 1,
//                       mx: 1,
//                       backgroundColor: "#e5e7eb",
//                       borderRadius: "4px",
//                       overflow: "hidden",
//                     }}
//                   >
//                     <Box
//                       sx={{
//                         width: `${getPercentage(value)}%`,
//                         height: 8,
//                         backgroundColor: color,
//                         transition: "width 0.5s ease-in-out",
//                       }}
//                     />
//                   </Box>
//                   <Typography variant="body2" sx={{ fontWeight: 700 }}>
//                     {value}
//                   </Typography>
//                 </Box>
//               ))}
//             </Box>
//           </Box>
//         </Card>
//         <br />
//         <Paper sx={{ width: "100%" }}>
//   <DataGrid
//     autoHeight
//     disableVirtualization
//     rows={flattenedRows}
//     columns={mergedColumns}
//     pagination
//     pageSizeOptions={[10, 25, 100]}
//     initialState={{
//       pagination: {
//         paginationModel: { pageSize: 10, page: 0 },
//       },
//     }}
//     onRowClick={handleRowClick}
//     // Use a fixed height for regular rows and a suitable height for sub-rows
//     getRowHeight={(params) => (params.model?.isSubRow ? 500 : 40)} // 500 ==> child.prop
//     sx={{
//       cursor: "pointer",
//       "& .subRow": {
//         bgcolor: "#f0f0f0",
//         color: "#555",
//         fontSize: "0.85rem",
//         pl: 4,

//       },
//     }}
//     getRowClassName={(params) => (params.row?.isSubRow ? "subRow" : "")}
//   />
// </Paper>
//       </Container>
//     </Box>
//   );
// }

//table with row dont open

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
import { format } from "date-fns";
import { hasFlag } from "country-flag-icons";
import Flags from "country-flag-icons/react/3x2";
import {
  fetchPhoneNumbers,
  createPhoneNumber,
  updatePhoneNumber,
} from "../api/containerService";
import TrackingDetails from "../component/TrackingDetails";
import { exportToExcel } from "../utils/exportToExcel";

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";

  return format(date, "dd MMM'’'yy h:mm a");
};

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
  "Tracking Completed",
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
  "Tracking Completed",
];

const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();

export default function Dashboard() {
  const authContext = useContext(AuthContext);
  const [shipments, setShipments] = useState<TrackedShipment[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<{
    [key: string]: { phone: string; shipmentId: string };
  }>({});
  const [localPhoneNumbers, setLocalPhoneNumbers] = useState<{
    [key: string]: string;
  }>({});
  const [phoneIds, setPhoneIds] = useState<{ [key: string]: string }>({});
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  useEffect(() => {
    if (authContext?.user?.winwordData?.data?.trackedShipments?.data) {
      setShipments(authContext.user.winwordData.data.trackedShipments.data);
    }
  }, [authContext?.user]);

  useEffect(() => {
    const loadPhoneNumbers = async () => {
      const containerIds = shipments.map((s) => s.shipment.containerNumber);
      const data = await fetchPhoneNumbers(containerIds);
      setPhoneNumbers(data);
      setLocalPhoneNumbers(
        Object.keys(data).reduce((acc, container) => {
          acc[container] = data[container]?.phone || "";
          return acc;
        }, {} as { [key: string]: string })
      );
    };

    loadPhoneNumbers();
  }, [shipments]);

  const handleInputChange = (containerNumber: string, value: string) => {
    setLocalPhoneNumbers((prev) => ({
      ...prev,
      [containerNumber]: value,
    }));
  };

  const handleSave = async (containerNumber: string, shipmentId: string) => {
    const newPhone = localPhoneNumbers[containerNumber];

    if (!newPhone || !shipmentId) return;

    await createPhoneNumber(containerNumber, newPhone, shipmentId);

    setPhoneNumbers((prev) => ({
      ...prev,
      [containerNumber]: { phone: newPhone, shipmentId },
    }));
  };

  const handleUpdate = async (containerNumber: string) => {
    const newPhone = localPhoneNumbers[containerNumber];
    const id = phoneIds[containerNumber];
    const shipmentId = phoneNumbers[containerNumber]?.shipmentId || "";

    if (!newPhone || !id || !shipmentId) return;

    await updatePhoneNumber(id, containerNumber, newPhone, shipmentId);

    setPhoneNumbers((prev) => ({
      ...prev,
      [containerNumber]: { phone: newPhone, shipmentId },
    }));
  };

  const handleDownloadExcel = () => {
    exportToExcel(columns, filteredRows, "ShipmentsData.xlsx");
  };

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
      {
        field: "pol",
        headerName: "POL",
        width: 200,
        renderCell: (params: any) => params.value || "N/A",
      },

      {
        field: "pod",
        headerName: "POD",
        width: 200,
        renderCell: (params) => params.value || "N/A",
      },

      {
        field: "path",
        headerName: "Path",
        width: 250,
        renderCell: (params) => (
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontWeight: "bold" }}>
              {params.value.pol} → {params.value.pod}
            </span>
            <LinearProgress
              variant="determinate"
              value={params.value.progress}
              sx={{ flexGrow: 1, height: "10px", borderRadius: "5px" }}
            />
            <span style={{ fontSize: "12px", fontWeight: "bold" }}>
              {Math.round(params.value.progress)}%
            </span>
          </div>
        ),
      },
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
        width: 200,
        renderCell: (params) =>
          formatEtaWithColor(params.value, params.row.statusInsights),
      },
      {
        field: "maritimeAiPredictedETA",
        headerName: "Maritime AI Predicted ETA",
        width: 200,
      },
      {
        field: "statusInsights",
        headerName: "Status & Insights",
        width: 220,
        renderCell: (params) => formatStatusInsights(params.value),
      },
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
      {
        field: "phoneNumber",
        headerName: "Phone Number",
        width: 300,
        renderCell: (params) => {
          const containerNumber = params.row.containerNumber;
          const shipmentId = params.row.shipmentId;
          const currentPhone = phoneNumbers[containerNumber]?.phone || "";
          const editedPhone =
            localPhoneNumbers[containerNumber] ?? currentPhone;

          return (
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                variant="outlined"
                size="small"
                value={editedPhone}
                onChange={(e) =>
                  handleInputChange(containerNumber, e.target.value)
                }
                sx={{ width: "140px" }}
              />
              {currentPhone ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpdate(containerNumber)}
                  disabled={!localPhoneNumbers[containerNumber]}
                >
                  Update
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleSave(containerNumber, shipmentId)}
                  disabled={!localPhoneNumbers[containerNumber]}
                >
                  Save
                </Button>
              )}
            </Box>
          );
        },
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
  const formatStatusInsights = (value: string) => {
    if (!value || value === "N/A" || value === "Unknown") {
      return <span style={{ color: "#999", fontSize: "13px" }}>N/A</span>;
    }

    let color = "#3b82f6";
    let sign = "";
    let label = "as initial ETA";
    let displayValue = "On Time";

    if (value.includes("Early")) {
      color = "#14b8a6";
      sign = "-";
      displayValue = `${value.replace(/\D/g, "")}d early`;
      label = "from initial ETA";
    } else if (value.includes("Significant delay")) {
      color = "#e67e22";
      sign = "+";
      displayValue = `${value.replace(/\D/g, "")}d late`;
      label = "from initial ETA";
    } else if (value.includes("Critical delay")) {
      color = "#ef4444";
      sign = "+";
      displayValue = `${value.replace(/\D/g, "")}d late`;
      label = "from initial ETA";
    } else if (value.includes("Tracking Completed")) {
      color = "#22c55e";
      displayValue = "Tracking Completed";
      label = "";
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "left",
          textAlign: "left",
          lineHeight: "1.2",
          padding: "4px 0",
        }}
      >
        <span style={{ color, fontWeight: "bold", fontSize: "14px" }}>
          {sign}
          {displayValue}
        </span>
        {label && (
          <span style={{ color: "#888", fontSize: "12px" }}>{label}</span>
        )}
      </div>
    );
  };

  const getFlag = (locode = "") => {
    if (!locode) return null;

    const countryCode = locode.slice(0, 2).toUpperCase();
    const exist = hasFlag(countryCode);
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

    if (!exist) {
      return null;
    } else {
      const countryName = regionNames.of(countryCode);
      const FlagComponent = Flags[countryCode];

      return FlagComponent ? (
        <FlagComponent
          title={countryName}
          style={{
            width: "20px",
            height: "14px",
            display: "inline-block",
            marginRight: "4px",
            verticalAlign: "middle",
            borderRadius: "2px",
            boxShadow: "0 0 2px rgba(0, 0, 0, 0.2)",
          }}
        />
      ) : null;
    }
  };

  const getPortWithFlag = (
    locode: string | undefined,
    name: string | undefined
  ) => {
    if (!locode || !name) return "N/A";

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "6px",
          textAlign: "left",
          padding: "3px 0",
        }}
      >
        {getFlag(locode)}
        <span style={{ fontSize: "13px", fontWeight: "bold" }}>{name}</span>
        <span style={{ fontSize: "11px", color: "#666" }}>{locode}</span>
      </div>
    );
  };
  const formatEtaWithColor = (
    dateString: string | undefined,
    status: string
  ) => {
    const formattedDate = formatDate(dateString);
    if (formattedDate === "N/A")
      return <span style={{ color: "#999" }}>N/A</span>;

    let color = "#3b82f6";
    if (status.includes("Early")) color = "#14b8a6";
    else if (status.includes("Significant delay")) color = "#e67e22";
    else if (status.includes("Critical delay")) color = "#ef4444";
    else if (status.includes("Tracking Completed")) color = "#22c55e";

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            backgroundColor: color,
            borderRadius: "50%",
            display: "inline-block",
          }}
        />
        <span>{formattedDate}</span>
      </div>
    );
  };

  const getPathProgress = (shipment: any) => {
    if (
      !shipment.status ||
      !shipment.initialCarrierETA ||
      !shipment.status.predicted?.datetime
    ) {
      return 0;
    }

    const shipmentStart = new Date(
      shipment.status.actualDepartureAt || shipment.status.estimatedDepartureAt
    );
    const shipmentEnd = new Date(
      shipment.status.predicted.datetime || shipment.status.actualArrivalAt
    );
    const now = new Date();

    if (shipmentStart >= shipmentEnd) return 100;

    const totalDuration = shipmentEnd.getTime() - shipmentStart.getTime();
    const elapsedDuration = now.getTime() - shipmentStart.getTime();
    return Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
  };

  const mapShipmentsToRows = (shipments: TrackedShipment[]) => {
    return shipments.map((tracked, index) => {
      const podPort =
        tracked.metadata?.businessData?.find(
          (item) => item.key === "Discharge Port"
        )?.value || "N/A";

      const customerNumber =
        tracked.metadata?.businessData?.find(
          (item) => item.key === "Customer Code"
        )?.value || "N/A";

      const pol = tracked.shipment.status?.pol?.properties || {};
      const pod = tracked.shipment.status?.pod?.properties || {};
      return {
        id: tracked.shipment.id ?? index,
        containerNumber: tracked.shipment.containerNumber || "N/A",
        bol: tracked.shipment.bol || "N/A",
        carrier: tracked.shipment.carrier?.shortName || "N/A",

        initialCarrierETD: tracked.shipment.initialCarrierETD
          ? formatDate(tracked.shipment.initialCarrierETD).toLocaleString()
          : "N/A",

        latestCarrierETDOrATD: tracked.shipment.status?.actualDepartureAt
          ? formatDate(
              tracked.shipment.status.actualDepartureAt
            ).toLocaleString()
          : tracked.shipment.status?.estimatedDepartureAt
          ? formatDate(
              tracked.shipment.status.estimatedDepartureAt
            ).toLocaleString()
          : "N/A",

        pol: tracked.shipment.status?.pol
          ? getPortWithFlag(
              tracked.shipment.status.pol.properties?.locode,
              tracked.shipment.status.pol.properties?.name
            )
          : "N/A",

        pod: tracked.shipment.status?.pod
          ? getPortWithFlag(
              tracked.shipment.status.pod.properties?.locode,
              podPort
            )
          : "N/A",

        path: {
          pol: tracked.shipment.status?.pol?.properties?.locode || "N/A",
          pod: tracked.shipment.status?.pod?.properties?.locode || "N/A",
          progress: getPathProgress(tracked.shipment),
        },
        //for Excel file
        polLocode: pol.locode || "N/A",
        polName: pol.name || "N/A",
        podLocode: pod.locode || "N/A",
        podName: pod.name || "N/A",

        containerStatus:
          tracked.shipment.status?.currentEvent?.description ||
          (tracked.shipment.status?.events &&
          tracked.shipment.status.events.length > 0
            ? tracked.shipment.status.events[
                tracked.shipment.status.events.length - 1
              ]?.description || "Unknown"
            : "Unknown"),

        currentVessel:
          tracked.shipment.status?.currentEvent?.vessel?.name ||
          (tracked.shipment.status?.events &&
          tracked.shipment.status.events.length > 0
            ? tracked.shipment.status.events[
                tracked.shipment.status.events.length - 1
              ]?.vessel?.name || "N/A"
            : "N/A"),

        initialCarrierETA: tracked.shipment.initialCarrierETA
          ? formatDate(tracked.shipment.initialCarrierETA).toLocaleString()
          : "N/A",
        latestCarrierETAOrATA: tracked.shipment.status?.actualArrivalAt
          ? formatDate(tracked.shipment.status.actualArrivalAt).toLocaleString()
          : tracked.shipment.status?.estimatedArrivalAt
          ? formatDate(
              tracked.shipment.status.estimatedArrivalAt
            ).toLocaleString()
          : "N/A",

        maritimeAiPredictedETA: tracked.shipment.status?.predicted?.datetime
          ? formatDate(
              tracked.shipment.status.predicted.datetime
            ).toLocaleString()
          : "N/A",

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
          // const init = tracked.shipment.initialCarrierETA;
          // const pred = tracked.shipment.status?.predicted?.diffFromCarrierDays;
          //todo consult with eyal if daydiff should be calclaued like so : (Maritime AI Predicted ETA - Initial Carrier ETA) or like so tracked.shipment.status?.predicted?.diffFromCarrierDays||0

          const diffDays =
            tracked.shipment.status?.predicted?.diffFromCarrierDays || 0;

          if (tracked.shipment.status?.voyageStatus === "trackingCompleted") {
            return "Tracking Completed";
          }

          if (diffDays === null) return "N/A";

          if (diffDays == 0) {
            return "On Time";
          } else if (diffDays < 0) {
            return `Early (${Math.abs(diffDays)}+ days)`;
          } else if (diffDays >= 1 && diffDays <= 4) {
            return `Significant delay (${diffDays} days)`;
          } else if (diffDays >= 5) {
            return `Critical delay (${diffDays}+ days)`;
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

  const rows = useMemo(() => {
    return mapShipmentsToRows(shipments).map((row) => ({
      ...row,
      shipmentId: row.id || "",
      phoneNumber: phoneNumbers[row.containerNumber]?.phone || "",
    }));
  }, [shipments, phoneNumbers]);

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
        selectedStatuses.some((status) =>
          row.statusInsights.startsWith(status.split("(")[0].trim())
        )
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

  const shipmentStats = useMemo(() => {
    let stats = {
      total: filteredRows.length,
      onTime: 0,
      early: 0,
      delayed: 0,
      critical: 0,
      completed: 0,
    };

    filteredRows.forEach((row) => {
      const status = row.statusInsights;

      if (status === "Tracking Completed") {
        stats.completed++;
      } else if (status.includes("On Time")) {
        stats.onTime++;
      } else if (status.includes("Early")) {
        stats.early++;
      } else if (status.includes("Significant delay")) {
        stats.delayed++;
      } else if (status.includes("Critical delay")) {
        stats.critical++;
      }
    });

    return stats;
  }, [filteredRows]);

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
            onClick={handleDownloadExcel}
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
            pagination
            pageSizeOptions={[10, 25, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            onRowClick={(params) => {
              console.log("Clicked row:", params.row);
              console.log("row.id type:", typeof params.row.id);
              if (expandedRowId === params.row.id) {
                setExpandedRowId(null);
              } else {
                setExpandedRowId(params.row.id);
              }
            }}
          />
        </Paper>

        {expandedRowId && (
          <TrackingDetails
            rowData={filteredRows.find((r) => r.id === expandedRowId)}
          />
        )}
      </Container>
    </Box>
  );
}
