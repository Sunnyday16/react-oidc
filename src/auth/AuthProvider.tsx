import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccessToken, IDToken, RefreshToken } from '@okta/okta-auth-js';
import oktaAuthService from './OktaAuthService';

interface AuthContextValue {
  isAuthenticated: boolean;
  idToken: IDToken | null;
  accessToken: AccessToken | null;
  refreshToken: RefreshToken | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  renewTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [idToken, setIdToken] = useState<IDToken | null>(null);
  const [accessToken, setAccessToken] = useState<AccessToken | null>(null);
  const [refreshToken, setRefreshToken] = useState<RefreshToken | null>(null);

  useEffect(() => {
    async function loadExistingTokens() {
      const tokens = await oktaAuthService.getTokens();
      if (tokens) {
        setIsAuthenticated(true);
        setIdToken(tokens.idToken ?? null);
        setAccessToken(tokens.accessToken ?? null);
        setRefreshToken(tokens.refreshToken ?? null);
      }
    }

    const subs = [
      oktaAuthService.subscribeToTokenChanges('idToken', setIdToken),
      oktaAuthService.subscribeToTokenChanges('accessToken', setAccessToken),
      oktaAuthService.subscribeToTokenChanges('refreshToken', setRefreshToken)
    ];

    loadExistingTokens();

    return () => {
      subs.forEach((sub) => sub?.());
    };
  }, []);

  useEffect(() => {
    setIsAuthenticated(Boolean(idToken && accessToken));
  }, [idToken, accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      idToken,
      accessToken,
      refreshToken,
      login: oktaAuthService.login,
      logout: oktaAuthService.logout,
      renewTokens: async () => {
        const tokens = await oktaAuthService.renewTokens();
        setIdToken(tokens.idToken ?? null);
        setAccessToken(tokens.accessToken ?? null);
        setRefreshToken(tokens.refreshToken ?? null);
      }
    }),
    [isAuthenticated, idToken, accessToken, refreshToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
