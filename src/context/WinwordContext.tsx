import { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { Backdrop } from "@mui/material";
import qs from "qs";

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
  const [isLoading, setIsLoading] = useState(false);

  const filterShipmentsByFieldValue = async (
    field: string,
    value: string,
    customerCodes: string[]
  ) => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
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
      <>
        <Backdrop open={isLoading} className="loading-backdrop">
          <div className="loading-image" />
        </Backdrop>
        <div className={isLoading ? "hide-content" : ""}>{children}</div>
      </>
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
