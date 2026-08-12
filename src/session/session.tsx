import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { setCustomerToken } from '@/services/http';
import type { AuthResponse, Customer } from '@/types/api';

interface SessionContextValue {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (auth: AuthResponse) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (auth: AuthResponse) => {
    setCustomer(auth.customer);
    setToken(auth.token);
    setCustomerToken(auth.token);
  };

  const logout = () => {
    setCustomer(null);
    setToken(null);
    setCustomerToken(null);
  };

  const value = useMemo<SessionContextValue>(
    () => ({ customer, token, isAuthenticated: !!token, login, logout }),
    [customer, token],
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
