// context/UserContext.tsx

import React, { createContext, useContext, useState } from "react";
import axios from "../api/axiosInstance";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: boolean;
  userType: string;
  company?: string; 
  password?: string;
}
export interface Company {
    id: string;
    customerNumber: number;
    customerName: string;
    taxNumber: number;
    isActive: boolean;
  }
  
interface UserContextType {
  users: User[];
  companies: Company[]; 
  fetchUsers: () => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  addUser:(user: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);


  const fetchUsers = async () => {
    try {
      const res = await axios.get("/Company/with-users");
      const companies = res.data;
      setCompanies(companies);

      const usersMap: Record<string, User> = {};

      companies.forEach((companyItem: any) => {
        const companyName = companyItem.customerName; 
        const companyUsers = companyItem.users || [];

        companyUsers.forEach((u: any) => {
          if (!usersMap[u.id]) {
            usersMap[u.id] = {
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
              phoneNumber: u.phone,
              status: u.isActive,
              userType: u.role === 1 ? "Super Admin" :u.role === 2 ? "Standard":"Admin", 
              company: companyName
            };
          } else {
            const existingUser = usersMap[u.id];
            existingUser.company = 
              existingUser.company + ", " + companyName;
          }
        });
      });

      const aggregatedUsers = Object.values(usersMap);

      setUsers(aggregatedUsers);
    } catch (error) {
      console.error("Failed to fetch users with all their companies:", error);
    }
  };

  const updateUser = async (id: string, updatedUser: Partial<User>) => {
    try {
      await axios.put(`/User/${id}`, updatedUser);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };
  const addUser = async (user: Partial<User>) => {
    try {
      await axios.post("/User", user);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };
  
  return (
    <UserContext.Provider value={{ users, fetchUsers, updateUser,addUser,companies }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserContext must be used within a UserProvider");
  return context;
};
