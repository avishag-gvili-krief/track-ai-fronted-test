// context/SmsContext.tsx
import React, { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useLoading } from "./LoadingContext";

export interface UserPhoneEntry {
  userId: string;
  phones: string[];
}

export interface SmsDto {
  id: string;
  container: string;
  userPhones: UserPhoneEntry[];
}

interface SmsContextType {
  userPhones: SmsDto[];
  fetchUserPhones: (userId: string) => Promise<void>;
  addOrUpdatePhones: (container: string, entry: UserPhoneEntry) => Promise<void>;
  removePhones: (container: string, userId: string) => Promise<void>;
}

const SmsContext = createContext<SmsContextType | undefined>(undefined);

export const SmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userPhones, setUserPhones] = useState<SmsDto[]>([]);
  const { showLoading, hideLoading } = useLoading();

  const fetchUserPhones = async (userId: string) => {
    showLoading();
    try {
      const response = await axiosInstance.get<SmsDto[]>(`/sms/by-user/${userId}`);
      setUserPhones(response.data);
    } catch (error) {
      console.error("Failed to fetch SMS by user:", error);
    }finally {
      hideLoading();
    }
  };

  const addOrUpdatePhones = async (container: string, entry: UserPhoneEntry) => {
    showLoading();
    try {
      await axiosInstance.post(`/sms/${container}`, entry);
      const userId = entry.userId;
      await fetchUserPhones(userId);
    } catch (error) {
      console.error("Failed to add or update phones:", error);
    }finally {
      hideLoading();
    }
  };

  const removePhones = async (container: string, userId: string) => {
    showLoading();
    try {
      await axiosInstance.delete(`/sms/${container}/${userId}`);
      await fetchUserPhones(userId);
    } catch (error) {
      console.error("Failed to delete phones:", error);
    }finally {
      hideLoading();
    }
  };

  return (
    <SmsContext.Provider
      value={{ userPhones, fetchUserPhones, addOrUpdatePhones, removePhones }}
    >
      {children}
    </SmsContext.Provider>
  );
};

export const useSmsContext = () => {
  const context = useContext(SmsContext);
  if (!context) throw new Error("useSmsContext must be used within a SmsProvider");
  return context;
};