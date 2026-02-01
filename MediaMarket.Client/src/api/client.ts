/**
 * API Client wrapper pre jednoduchšie použitie
 * 
 * Tento súbor poskytuje konfigurovaný API klient s predvolenými nastaveniami.
 * Importuj tento súbor namiesto priameho importu z generated.
 * 
 * POZNÁMKA: Najprv musíš spustiť `npm run generate:api` aby sa vytvorili súbory v ./generated/
 */

import { ApiClient } from './generated';

// Backend URL - môžeš zmeniť podľa potreby cez .env súbor
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5234';

// Funkcia na získanie access tokenu z localStorage
const getAccessToken = (): string | undefined => {
  return localStorage.getItem('accessToken') || undefined;
};

// Vytvor a exportuj konfigurovaný API klient
export const apiClient = new ApiClient({
  BASE: API_BASE_URL,
  HEADERS: {
    // Automaticky pridaj Authorization header ak existuje token
    get Authorization() {
      const token = getAccessToken();
      return token ? `Bearer ${token}` : undefined;
    },
  },
});

// Re-export všetkých typov pre pohodlie
// Všetky modely sú už exportované v ./generated/index.ts
export * from './generated';
