import { createContext, useState, useContext} from "react";
import axiosInstance from "../api/axiosInstance";
import qs from "qs";
import { useLoading } from "./LoadingContext";

interface TrackedShipmentsResponse {
  data: {
    trackedShipments: {
      data: any[];
    };
  };
}

interface WinwordContextType {
  winwordData: TrackedShipmentsResponse | null;
  filterShipmentsByFieldValue: (
    field: string,
    value: string,
    customerCodes: string[]
  ) => Promise<void>;
  resetWinwordData: () => void;
}

export const WinwordContext = createContext<WinwordContextType | null>(null);

export const WinwordProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [winwordData, setWinwordData] =
    useState<TrackedShipmentsResponse | null>(null);
  const { showLoading, hideLoading } = useLoading();

  const filterShipmentsByFieldValue = async (
    field: string,
    value: string,
    customerCodes: string[]
  ) => {
    try {
      showLoading();
      const response = await axiosInstance.get<TrackedShipmentsResponse>(
        "/winword/filter",
        {
          params: {
            field,
            value,
            customerCodes,
          },
          paramsSerializer: (params) =>
            qs.stringify(params, { arrayFormat: "repeat" }),
        }
      );
      console.log("response.data", response.data);

      setWinwordData(response.data);
    } catch (error) {
      console.error("Failed to fetch filtered WIN data:", error);
    } finally {
      hideLoading();
    }
  };

  const resetWinwordData = () => {
    setWinwordData(null);
  };

  return (
    <WinwordContext.Provider
      value={{
        winwordData,
        filterShipmentsByFieldValue,
        resetWinwordData,
      }}
    >
      {children}
    </WinwordContext.Provider>
  );
};

export const useWinwordContext = () => {
  const context = useContext(WinwordContext);
  if (!context) {
    throw new Error("useWinwordContext must be used within a WinwordProvider");
  }
  return context;
};
