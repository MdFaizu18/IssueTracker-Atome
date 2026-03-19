/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import { loginUser, mapBackendUserToUiUser, registerUser } from '../lib/api';

const AUTH_STORAGE_KEY = 'auth_user';

function loadAuthUserFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return mapBackendUserToUiUser(parsed);
  } catch {
    return null;
  }
}

function storeAuthUserInStorage(backendUser) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(backendUser));
}

function clearAuthStorage() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadAuthUserFromStorage());

  const login = async (email, _password) => {
    try {
      const backendUser = await loginUser({ email, password: _password });
      storeAuthUserInStorage(backendUser);
      setUser(mapBackendUserToUiUser(backendUser));
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name, email, _password, role, profileImage) => {
    try {
      await registerUser({
        name,
        email,
        password: _password,
        role,
        profile: profileImage || '',
      });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
