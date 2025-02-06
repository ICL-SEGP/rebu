"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Define the data structure for the dashboard
interface DashboardData {
  availableTokens: number;
  lockedTokens: number;
  purchases: { date: string; product: string; amount: string }[];
}

// Create default data for the dashboard
const defaultDashboardData: DashboardData = {
  availableTokens: 0,
  lockedTokens: 0,
  purchases: [],
};

// Create the context with a proper type
const DashboardContext = createContext<DashboardData | null>(null);

// Create a provider component
export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [dashboardData] = useState<DashboardData>(defaultDashboardData);

  return (
    <DashboardContext.Provider value={dashboardData}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook to use the Dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardContext.Provider");
  }
  return context;
};

export default DashboardContext;
