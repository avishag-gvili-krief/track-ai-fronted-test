import React, { useState } from "react";
import { useCompanyContext } from "../context/CompanyContext";
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function AddCompany() {
  const navigate = useNavigate();
  const { addCompany } = useCompanyContext();

  const [newCompany, setNewCompany] = useState({
    customerNumber: "",
    customerName: "",
    taxNumber: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [errors, setErrors] = useState({
    customerNumber: "",
    taxNumber: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Prevent whitespace input
    // if (/\s/.test(value)) return;

    setNewCompany((prev) => ({ ...prev, [name]: value }));

    // Clear errors on change
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { customerNumber: "", taxNumber: "" };

    // Validate customerNumber
    if (!/^\d{4,6}$/.test(newCompany.customerNumber)) {
      newErrors.customerNumber =
        "Customer number must be a number between 4 to 6 digits";
      isValid = false;
    }

    // Validate taxNumber
    if (!/^\d{9}$/.test(newCompany.taxNumber)) {
      newErrors.taxNumber = "Tax number must be exactly 9 digits";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await addCompany({
        customerNumber: parseInt(newCompany.customerNumber),
        customerName: newCompany.customerName,
        taxNumber: parseInt(newCompany.taxNumber),
        isActive: true,
      });

      setSnackbar({
        open: true,
        message: "Company added successfully!",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/manage-company");
      }, 1000);
    } catch (error) {
      console.error("Error adding company:", error);
      setSnackbar({
        open: true,
        message: "Failed to add company. Please try again.",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 3, width: "100%", maxWidth: "900px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#1a237e",
          textAlign: "center",
          mb: 3,
        }}
      >
        Add New Company
      </Typography>

      <Card
        sx={{
          p: 4,
          borderRadius: "12px",
          boxShadow: 2,
          border: "1px solid #1a237e",
        }}
      >
        <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={3}>
          <Box>
            <Typography sx={{ fontWeight: "bold", color: "#1a237e", mb: 1 }}>
              Customer Number
            </Typography>
            <TextField
              name="customerNumber"
              value={newCompany.customerNumber}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              error={!!errors.customerNumber}
              helperText={errors.customerNumber}
            />
          </Box>

          <Box>
            <Typography sx={{ fontWeight: "bold", color: "#1a237e", mb: 1 }}>
              Customer Name
            </Typography>
            <TextField
              name="customerName"
              value={newCompany.customerName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
          </Box>

          <Box gridColumn="span 2">
            <Typography sx={{ fontWeight: "bold", color: "#1a237e", mb: 1 }}>
              Tax Number
            </Typography>
            <TextField
              name="taxNumber"
              value={newCompany.taxNumber}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              error={!!errors.taxNumber}
              helperText={errors.taxNumber}
            />
          </Box>
        </Box>

        <Box display="flex" justifyContent="center" gap={2} mt={4}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              bgcolor: "#1a237e",
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: "8px",
              px: 4,
            }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/manage-company")}
            sx={{
              bgcolor: "#1a237e",
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: "8px",
              px: 4,
            }}
          >
            Cancel
          </Button>
        </Box>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
