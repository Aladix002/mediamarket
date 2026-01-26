import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Inquiry, mockInquiries, Order, mockOrders } from '@/data/mockData';

export type UserRole = 'visitor' | 'agency' | 'media' | 'admin';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  // Legacy inquiries (for backward compatibility)
  inquiries: Inquiry[];
  addInquiry: (inquiry: Inquiry) => void;
  // New orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>('visitor');
  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const addInquiry = (inquiry: Inquiry) => {
    setInquiries(prev => [inquiry, ...prev]);
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  return (
    <AppContext.Provider value={{ 
      role, 
      setRole, 
      inquiries, 
      addInquiry,
      orders,
      addOrder,
      updateOrderStatus 
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
