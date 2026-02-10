import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Inquiry } from '@/data/mockData';

export type UserRole = 'visitor' | 'agency' | 'media' | 'admin';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userId: string | null;
  setUserId: (userId: string | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  refreshToken: string | null;
  setRefreshToken: (token: string | null) => void;
  // Legacy inquiries (for backward compatibility - deprecated)
  inquiries: Inquiry[];
  addInquiry: (inquiry: Inquiry) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('role');
    return (savedRole as UserRole) || 'visitor';
  });
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem('userId');
  });
  const [accessToken, setAccessTokenState] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });
  const [refreshToken, setRefreshTokenState] = useState<string | null>(() => {
    return localStorage.getItem('refreshToken');
  });
  const [inquiries, setInquiries] = useState<Inquiry[]>([]); // Legacy - deprecated

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  };

  const setRefreshToken = (token: string | null) => {
    setRefreshTokenState(token);
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  };

  const setUserIdWithStorage = (id: string | null) => {
    setUserId(id);
    if (id) {
      localStorage.setItem('userId', id);
    } else {
      localStorage.removeItem('userId');
    }
  };

  const setRoleWithStorage = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('role', newRole);
  };

  const addInquiry = (inquiry: Inquiry) => {
    setInquiries(prev => [inquiry, ...prev]);
  };

  return (
    <AppContext.Provider value={{ 
      role, 
      setRole: setRoleWithStorage,
      userId,
      setUserId: setUserIdWithStorage,
      accessToken,
      setAccessToken,
      refreshToken,
      setRefreshToken,
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
