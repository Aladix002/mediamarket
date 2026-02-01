import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Inquiry } from '@/data/mockData';

export type UserRole = 'visitor' | 'agency' | 'media' | 'admin';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userId: string | null;
  setUserId: (userId: string | null) => void;
  // Legacy inquiries (for backward compatibility - deprecated)
  inquiries: Inquiry[];
  addInquiry: (inquiry: Inquiry) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>('visitor');
  const [userId, setUserId] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]); // Legacy - deprecated

  const addInquiry = (inquiry: Inquiry) => {
    setInquiries(prev => [inquiry, ...prev]);
  };

  return (
    <AppContext.Provider value={{ 
      role, 
      setRole,
      userId,
      setUserId,
      inquiries, 
      addInquiry,
    }}>
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
