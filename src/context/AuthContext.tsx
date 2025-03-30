import { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { User } from "../types/AuthTypes";
import { Backdrop } from "@mui/material";
import "../css/Login.css";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      fetchUser();
    } else {
      setIsInitialized(true);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await axiosInstance.get<User>("/auth/me");
      setUser({
        id: data.id,
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        expiration: data.expiration,
        reminders: data.reminders ?? [],
        activeCustomers: data.activeCustomers ?? [],
        winwordData: Array.isArray(data.winwordData)
          ? { data: { trackedShipments: { data: data.winwordData } } }
          : data.winwordData,
      });
    } catch (error) {
      console.error("Failed to fetch user", error);
      logout();
    } finally {
      setIsInitialized(true);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      console.log("Response from server:", data);

      localStorage.setItem("token", data.token);
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.token}`;

      setUser({
        id: data.id,
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        expiration: data.expiration,
        phone: data.phone,
        reminders: data.reminders ?? [],
        activeCustomers: data.activeCustomers ?? [],
        winwordData: Array.isArray(data.winwordData)
          ? { data: { trackedShipments: { data: data.winwordData } } }
          : data.winwordData,
      });
    } catch (error) {
      console.error("Login failed", error);
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    delete axiosInstance.defaults.headers.common["Authorization"];
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <>
        {}
        <Backdrop open={!isInitialized} className="loading-backdrop">
          <div className="loading-image"></div>
        </Backdrop>

        {}
        <div className={isInitialized ? "" : "hide-content"}>{children}</div>
      </>
    </AuthContext.Provider>
  );
};
