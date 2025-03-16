import React, { Fragment } from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  TextField,
  Button,
  Collapse,
} from "@mui/material";
import "../css/DashboardStyles.css";

interface Shipment {
  id: string;
  containerNumber: string;
  bol: string;
  latestCarrier?: string;
  initialCarrierETD?: string;
  latestCarrierETD?: string;
  pol?: string;
  path?: string;
  pod?: string;
  containerStatus?: string;
  vessel?: string;
  // ... שדות נוספים
  smsAlert?: string;
  isOpenRow?: boolean;
  events?: any[]; // לדוגמה
}

interface TableComponentProps {
  shipments: Shipment[];
  handleRowSelection: (rowIndex: number, e: any, record: Shipment) => void;
  selectedRec: Record<string, boolean>;
  rowClick: (record: Shipment, index: number) => void;
}

const TableComponent: React.FC<TableComponentProps> = ({
  shipments,
  handleRowSelection,
  selectedRec,
  rowClick,
}) => {
  return (
    <TableContainer className="tableContainer">
      <Table>
        <TableHead>
          <TableRow className="tableHeader">
            <TableCell className="checkboxColumn" />
            <TableCell>Container Number</TableCell>
            <TableCell>BOL</TableCell>
            <TableCell>Latest Carrier</TableCell>
            <TableCell>Initial Carrier ETD</TableCell>
            <TableCell>Latest Carrier ETD/ATD</TableCell>
            <TableCell>POL</TableCell>
            <TableCell>Path</TableCell>
            <TableCell>POD</TableCell>
            <TableCell>Container Status</TableCell>
            <TableCell>Current Vessel</TableCell>
            <TableCell>Initial Carrier ETA</TableCell>
            <TableCell>Latest Carrier ETA/ATA</TableCell>
            <TableCell>Maritime AI Predicted ETA</TableCell>
            <TableCell>Status & Insights</TableCell>
            <TableCell>Origin Country</TableCell>
            <TableCell>Supplier Name</TableCell>
            <TableCell>Consignee Address</TableCell>
            <TableCell>Customer Reference</TableCell>
            <TableCell>Add SMS Alert</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {shipments.map((record, index) => (
            <Fragment key={record.id}>
              <TableRow
                className="tableRowHover"
                onClick={() => rowClick(record, index)}
              >
                <TableCell className="checkboxColumn">
                  <Checkbox
                    checked={selectedRec[record.id] || false}
                    onChange={(e) => handleRowSelection(index, e, record)}
                  />
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {record.containerNumber}
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {record.bol}
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {record.latestCarrier || "N/A"}
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {record.initialCarrierETD || "N/A"}
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {record.latestCarrierETD || "N/A"}
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {record.pol || "N/A"}
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {record.path || "N/A"}
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {record.pod || "N/A"}
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {record.containerStatus || "N/A"}
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {record.vessel || "N/A"}
                </TableCell>
                {/* ... וכו' לשאר העמודות ... */}
                <TableCell className="tableCellFontSize">
                  {/* Initial Carrier ETA */}
                  N/A
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {/* Latest Carrier ETA/ATA */}
                  N/A
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {/* Maritime AI Predicted ETA */}
                  N/A
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {/* Status & Insights */}
                  N/A
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {/* Origin Country */}
                  N/A
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {/* Supplier Name */}
                  N/A
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {/* Consignee Address */}
                  N/A
                </TableCell>
                <TableCell className="tableCellFontSize">
                  {/* Customer Reference */}
                  N/A
                </TableCell>
                <TableCell className="tableCellFontSize">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <TextField
                      size="small"
                      defaultValue={record.smsAlert || ""}
                      style={{ width: "120px" }}
                    />
                    <Button
                      className="smsOkButton"
                      variant="contained"
                      size="small"
                    >
                      OK
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {/* דוגמה אם אתה רוצה row נוסף ב-collpase */}
              {record.isOpenRow && (
                <TableRow>
                  <TableCell colSpan={20}>
                    <Collapse in={record.isOpenRow} timeout="auto" unmountOnExit>
                      {/* כאן אפשר להציג events וכו' */}
                      <div style={{ padding: "10px" }}>
                        More details for {record.containerNumber}
                      </div>
                    </Collapse>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableComponent;
