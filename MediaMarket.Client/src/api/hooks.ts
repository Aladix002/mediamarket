/**
 * React hooks pre prácu s API
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './client';
import { mapOfferResponseToOffer, mapOrderResponseToOrder } from './mappers';
import type { Offer, Order } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

/**
 * Hook pre načítanie ponúk
 */
export function useOffers(filters?: {
  status?: 'draft' | 'published' | 'archived';
  mediaType?: 'online' | 'rádio' | 'OOH' | 'print' | 'sociální sítě' | 'video' | 'influenceři';
  mediaUserId?: string;
}) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.offers.getOffers({
        status: filters?.status !== undefined 
          ? (filters.status === 'draft' ? 0 : filters.status === 'published' ? 1 : 2)
          : undefined,
        mediaType: filters?.mediaType !== undefined
          ? (filters.mediaType === 'online' ? 0 : 
             filters.mediaType === 'rádio' ? 1 :
             filters.mediaType === 'OOH' ? 2 :
             filters.mediaType === 'print' ? 3 :
             filters.mediaType === 'sociální sítě' ? 4 :
             filters.mediaType === 'video' ? 5 : 6)
          : undefined,
        mediaUserId: filters?.mediaUserId,
      });

      const mappedOffers = response.map(mapOfferResponseToOffer);
      setOffers(mappedOffers);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Nepodarilo sa nacitat ponuky');
      setError(error);
      toast({
        title: 'Chyba',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.mediaType, filters?.mediaUserId]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return { offers, loading, error, refetch: fetchOffers };
}

/**
 * Hook pre načítanie jednej ponuky
 */
export function useOffer(id: string | undefined) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchOffer = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.offers.getOfferById({ id });
        const mappedOffer = mapOfferResponseToOffer(response);
        setOffer(mappedOffer);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Nepodarilo sa nacitat ponuku');
        setError(error);
        toast({
          title: 'Chyba',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  return { offer, loading, error };
}

/**
 * Hook pre načítanie objednávok
 */
export function useOrders(filters?: {
  status?: 'nová' | 'v řešení' | 'objednávka uzavřena';
  agencyUserId?: string;
  mediaUserId?: string;
  offerId?: string;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.orders.getOrders({
        status: filters?.status !== undefined
          ? (filters.status === 'nová' ? 0 : filters.status === 'v řešení' ? 1 : 2)
          : undefined,
        agencyUserId: filters?.agencyUserId,
        mediaUserId: filters?.mediaUserId,
        offerId: filters?.offerId,
      });

      const mappedOrders = response.map(mapOrderResponseToOrder);
      setOrders(mappedOrders);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Nepodarilo sa nacitat objednavky');
      setError(error);
      toast({
        title: 'Chyba',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.agencyUserId, filters?.mediaUserId, filters?.offerId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}

/**
 * Hook pre vytvorenie objednávky
 */
export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createOrder = useCallback(async (
    offerId: string,
    agencyUserId: string,
    data: {
      preferredFrom: string;
      preferredTo: string;
      quantityUnits?: number;
      impressions?: number;
      note?: string;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.orders.createOrder({
        agencyUserId,
        requestBody: {
          offerId,
          preferredFrom: data.preferredFrom,
          preferredTo: data.preferredTo,
          quantityUnits: data.quantityUnits,
          impressions: data.impressions,
          note: data.note || '',
        },
      });

      toast({
        title: 'Úspech',
        description: 'Objednávka bola úspešne vytvorená',
      });

      return mapOrderResponseToOrder(response);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Nepodarilo sa vytvorit objednavku');
      setError(error);
      toast({
        title: 'Chyba',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createOrder, loading, error };
}

/**
 * Hook pre zmenu statusu objednávky
 */
export function useUpdateOrderStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStatus = useCallback(async (
    orderId: string,
    status: 'nová' | 'v řešení' | 'objednávka uzavřena'
  ) => {
    try {
      setLoading(true);
      setError(null);

      const statusNum = status === 'nová' ? 0 : status === 'v řešení' ? 1 : 2;

      await apiClient.orders.updateOrderStatus({
        id: orderId,
        requestBody: {
          status: statusNum,
        },
      });

      toast({
        title: 'Úspech',
        description: 'Status objednávky bol aktualizovaný',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Nepodarilo sa aktualizovat status');
      setError(error);
      toast({
        title: 'Chyba',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateStatus, loading, error };
}

/**
 * Hook pre registráciu
 */
export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    companyName: string;
    contactName: string;
    phone: string;
    role: 0 | 1; // 0 = Agency, 1 = Media
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.auth.register({
        requestBody: data,
      });

      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Nepodarilo sa zaregistrovat');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loading, error };
}

/**
 * Hook pre email verification
 */
export function useVerifyEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const verifyEmail = useCallback(async (token: string, type: string = 'signup') => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.auth.verifyEmail({
        requestBody: {
          token,
          type,
        },
      });

      if (response.success) {
        toast({
          title: 'Úspěch',
          description: response.message || 'Email byl úspěšně ověřen',
        });
      }

      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Nepodařilo se ověřit email');
      setError(error);
      toast({
        title: 'Chyba',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { verifyEmail, loading, error };
}

/**
 * Hook pre resend verification email
 */
export function useResendVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resendVerification = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.auth.resendVerification({
        requestBody: {
          email,
        },
      });

      if (response.success) {
        toast({
          title: 'Úspěch',
          description: response.message || 'Ověřovací email byl poslán',
        });
      }

      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Nepodařilo se poslat ověřovací email');
      setError(error);
      toast({
        title: 'Chyba',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { resendVerification, loading, error };
}
