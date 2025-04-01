import React, { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useLoading } from "./LoadingContext";

interface Company {
  id: string;
  customerNumber: number;
  customerName: string;
  taxNumber: number;
  isActive: boolean;
}

interface CompanyContextType {
  companies: Company[];
  fetchCompanies: () => void;
  addCompany: (company: Omit<Company, "id">) => Promise<void>;
  updateCompany: (id: string, company: Omit<Company, "id">) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const { showLoading, hideLoading } = useLoading();
  const fetchCompanies = async () => {
    showLoading();
    try {
      const response = await axiosInstance.get("/Company");
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      hideLoading();
    }
  };

  const addCompany = async (company: Omit<Company, "id">) => {
    showLoading();
    try {
      const response = await axiosInstance.post("/Company", company);
      setCompanies([...companies, response.data]);
    } catch (error) {
      console.error("Error adding company:", error);
    } finally {
      hideLoading();
    }
  };

  const updateCompany = async (id: string, company: Omit<Company, "id">) => {
    showLoading();
    try {
      await axiosInstance.put(`/Company/${id}`, company);
      setCompanies(
        companies.map((c) => (c.id === id ? { id, ...company } : c))
      );
    } catch (error) {
      console.error("Error updating company:", error);
    } finally {
      hideLoading();
    }
  };

  const deleteCompany = async (id: string) => {
    showLoading();
    try {
      await axiosInstance.delete(`/Company/${id}`);
      setCompanies(companies.filter((company) => company.id !== id));
    } catch (error) {
      console.error("Error deleting company:", error);
    } finally {
      hideLoading();
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        companies,
        fetchCompanies,
        addCompany,
        updateCompany,
        deleteCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompanyContext = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompanyContext must be used within a CompanyProvider");
  }
  return context;
};
