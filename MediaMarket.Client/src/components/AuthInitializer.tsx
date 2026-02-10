import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/api/client';

/**
 * Komponenta na automatické obnovenie session pri načítaní aplikácie
 */
const AuthInitializer = () => {
  const { accessToken, refreshToken, setAccessToken, setRefreshToken, setUserId, setRole } = useApp();

  useEffect(() => {
    const restoreSession = async () => {
      // Ak nemáme token, nič nerobíme
      if (!accessToken) {
        return;
      }

      try {
        // Skús získať aktuálneho používateľa (overí token)
        const user = await apiClient.auth.getCurrentUser();
        
        if (user && user.id) {
          // Token je platný, obnov session
          setUserId(user.id.toString());
          // Konvertuj enum role na string (0=Admin, 1=Media, 2=Agency)
          const roleMap: Record<number, 'agency' | 'media' | 'admin'> = {
            0: 'admin',
            1: 'media',
            2: 'agency',
          };
          if (user.role !== undefined) {
            setRole(roleMap[user.role] || 'visitor');
          }
        }
      } catch (error) {
        // Token nie je platný, skús refresh
        if (refreshToken) {
          try {
            const response = await apiClient.auth.refreshToken({
              requestBody: {
                refreshToken: refreshToken,
              },
            });

            if (response.success && response.accessToken && response.user) {
              // Úspešne obnovený token
              setAccessToken(response.accessToken);
              if (response.refreshToken) {
                setRefreshToken(response.refreshToken);
              }
              setUserId(response.user.id.toString());
              // response.user.role je už string z LoginResponse
              setRole(response.user.role?.toLowerCase() as 'agency' | 'media' | 'admin' || 'visitor');
            } else {
              // Refresh zlyhal, odhlás používateľa
              setAccessToken(null);
              setRefreshToken(null);
              setUserId(null);
              setRole('visitor');
            }
          } catch (refreshError) {
            // Refresh zlyhal, odhlás používateľa
            setAccessToken(null);
            setRefreshToken(null);
            setUserId(null);
            setRole('visitor');
          }
        } else {
          // Nemáme refresh token, odhlás používateľa
          setAccessToken(null);
          setRefreshToken(null);
          setUserId(null);
          setRole('visitor');
        }
      }
    };

    restoreSession();
  }, []); // Spusti len raz pri načítaní

  return null;
};

export default AuthInitializer;
