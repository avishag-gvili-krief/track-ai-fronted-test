// 📁 File: src/component/DashboardToolbar.tsx

import React from "react";
import {
  Box,
  Button,
  Select,
  MenuItem,
  Checkbox,
  TextField,
  Popper,
  Paper,
  ClickAwayListener,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import FiltersPanel from "./FiltersPanel";

interface Company {
  id: string;
  customerNumber: string;
  customerName: string;
}

interface Props {
  searchText: string;
  requestSearch: (text: string) => void;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  selectedCompanies: string[];
  setSelectedCompanies: (companies: string[]) => void;
  selectedInsights: string[];
  selectedStatuses: string[];
  handleFilterChange: (value: string, type: "insight" | "status") => void;
  handleDownloadExcel: () => void;
  companies: Company[];
}

const DashboardToolbar: React.FC<Props> = ({
  searchText,
  requestSearch,
  filterOpen,
  setFilterOpen,
  selectedCompanies,
  setSelectedCompanies,
  selectedInsights,
  selectedStatuses,
  handleFilterChange,
  handleDownloadExcel,
  companies,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setFilterOpen(!filterOpen);
  };

  const handleClickAway = () => {
    setFilterOpen(false);
    setAnchorEl(null);
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
      <TextField
        variant="outlined"
        placeholder="Search in list"
        value={searchText}
        onChange={(e) => requestSearch(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon sx={{ color: "gray", mr: 1 }} /> }}
        sx={{ width: 250, bgcolor: "white", borderRadius: "4px" }}
      />

      <Box>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleFilterClick}
          sx={{ mx: 1, bgcolor: "white", borderRadius: "8px", fontWeight: 600, textTransform: "none" }}
        >
          Filter
        </Button>

        <Popper
          open={filterOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
          style={{ zIndex: 1300 }}
        >
          <ClickAwayListener onClickAway={handleClickAway}>
            <Paper
              elevation={3}
              sx={{
                width: 260,
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: 3,
                p: 2,
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              <FiltersPanel
                open={filterOpen}
                onClose={handleClickAway}
                selectedInsights={selectedInsights}
                selectedStatuses={selectedStatuses}
                handleFilterChange={handleFilterChange}
              />
            </Paper>
          </ClickAwayListener>
        </Popper>
      </Box>

      <Select
        multiple
        value={selectedCompanies}
        onChange={(e) => {
          const value = e.target.value;
          setSelectedCompanies(typeof value === "string" ? value.split(",") : value);
        }}
        renderValue={(selected) =>
          selected.length === 0
            ? "Select Company"
            : companies
                .filter((c) => selected.includes(c.customerNumber.toString()))
                .map((c) => c.customerName)
                .join(", ")
        }
        sx={{ minWidth: 250, bgcolor: "white", borderRadius: "4px" }}
      >
        {companies.map((company) => (
          <MenuItem key={company.id} value={company.customerNumber.toString()}>
            <Checkbox checked={selectedCompanies.includes(company.customerNumber.toString())} />
            {company.customerName}
          </MenuItem>
        ))}
      </Select>

      <Button
        sx={{ ml: 1, bgcolor: "orange", color: "white", fontWeight: "bold", textTransform: "none" }}
        onClick={handleDownloadExcel}
      >
        <CloudDownloadIcon />
      </Button>
    </Box>
  );
};

export default DashboardToolbar;
