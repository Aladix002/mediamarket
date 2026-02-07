/**
 * React hooks pre prácu s API
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './client';
import { mapOfferResponseToOffer, mapOrderResponseToOrder } from './mappers';
import type { Offer, Order } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

// Get API base URL from environment or default
const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5234';
};

/**
 * Hook pre načítanie ponúk
 */
export function useOffers(filters?: {
  status?: 'draft' | 'published' | 'archived';
  mediaType?: 'online' | 'rádio' | 'OOH' | 'print' | 'sociální sítě' | 'video' | 'influenceři';
  mediaUserId?: string;
  validFrom?: string; // ISO date string
  validTo?: string; // ISO date string
  minPrice?: number;
  maxPrice?: number;
  minCpt?: number;
  maxCpt?: number;
  tag?: 'akce' | 'speciál' | 'last-minute';
  searchQuery?: string;
}) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Map tag string to enum value
      const tagValue = filters?.tag === 'akce' ? 1 : 
                       filters?.tag === 'speciál' ? 2 : 
                       filters?.tag === 'last-minute' ? 4 : 
                       undefined;

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filters?.status !== undefined) {
        queryParams.append('status', String(filters.status === 'draft' ? 0 : filters.status === 'published' ? 1 : 2));
      }
      if (filters?.mediaType !== undefined) {
        queryParams.append('mediaType', String(
          filters.mediaType === 'online' ? 0 : 
          filters.mediaType === 'rádio' ? 1 :
          filters.mediaType === 'OOH' ? 2 :
          filters.mediaType === 'print' ? 3 :
          filters.mediaType === 'sociální sítě' ? 4 :
          filters.mediaType === 'video' ? 5 : 6
        ));
      }
      if (filters?.mediaUserId) {
        queryParams.append('mediaUserId', filters.mediaUserId);
      }
      if (filters?.validFrom) {
        queryParams.append('validFrom', filters.validFrom);
      }
      if (filters?.validTo) {
        queryParams.append('validTo', filters.validTo);
      }
      if (filters?.minPrice !== undefined) {
        queryParams.append('minPrice', String(filters.minPrice));
      }
      if (filters?.maxPrice !== undefined) {
        queryParams.append('maxPrice', String(filters.maxPrice));
      }
      if (filters?.minCpt !== undefined) {
        queryParams.append('minCpt', String(filters.minCpt));
      }
      if (filters?.maxCpt !== undefined) {
        queryParams.append('maxCpt', String(filters.maxCpt));
      }
      if (tagValue !== undefined) {
        queryParams.append('tag', String(tagValue));
      }
      if (filters?.searchQuery) {
        queryParams.append('searchQuery', filters.searchQuery);
      }

      // Use fetch directly to support all query parameters
      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/api/offers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const mappedOffers = data.map(mapOfferResponseToOffer);
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
  }, [
    filters?.status, 
    filters?.mediaType, 
    filters?.mediaUserId,
    filters?.validFrom,
    filters?.validTo,
    filters?.minPrice,
    filters?.maxPrice,
    filters?.minCpt,
    filters?.maxCpt,
    filters?.tag,
    filters?.searchQuery,
  ]);

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
