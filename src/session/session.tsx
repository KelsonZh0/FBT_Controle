import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setCustomerToken, setOnUnauthorized } from '@/services/http';
import type { AuthResponse, Customer } from '@/types/api';
import { clearAuthSession, getAuthSession, saveAuthSession } from '@/lib/secureStorage';
import { queryClient } from '@/lib/queryClient';

interface SessionContextValue {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (auth: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    setCustomer(null);
    setToken(null);
    setCustomerToken(null);
    await clearAuthSession();
    queryClient.clear();
  }, []);

  const login = useCallback(async (auth: AuthResponse) => {
    setCustomer(auth.customer);
    setToken(auth.token);
    setCustomerToken(auth.token);
    await saveAuthSession(auth.token, auth.customer);
  }, []);

  // Restaura o token persistido no hardware via expo-secure-store
  useEffect(() => {
    async function restoreSession() {
      try {
        const session = await getAuthSession();
        if (session.token && session.customer) {
          setToken(session.token);
          setCustomer(session.customer);
          setCustomerToken(session.token);
        }
      } catch (err) {
        console.error('Erro ao restaurar sessão segura:', err);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  // Se o backend retornar 401 Unauthorized (token expirado/inválido), faz logout automático
  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
    });
    return () => setOnUnauthorized(null);
  }, [logout]);

  const value = useMemo<SessionContextValue>(
    () => ({
      customer,
      token,
      isAuthenticated: !!token,
      isLoading,
      login,
      logout,
    }),
    [customer, token, isLoading, login, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession precisa ser usado dentro de <SessionProvider>.');
  }
  return ctx;
}
