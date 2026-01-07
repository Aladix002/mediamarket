import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Inquiry, mockInquiries } from '@/data/mockData';

export type UserRole = 'visitor' | 'agency' | 'media' | 'admin';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  inquiries: Inquiry[];
  addInquiry: (inquiry: Inquiry) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>('visitor');
  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);

  const addInquiry = (inquiry: Inquiry) => {
    setInquiries(prev => [inquiry, ...prev]);
  };

  return (
    <AppContext.Provider value={{ role, setRole, inquiries, addInquiry }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
