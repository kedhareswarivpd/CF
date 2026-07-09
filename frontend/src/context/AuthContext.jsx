import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const register = async (name, email, password) => {
    await registerApi(name, email, password);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error('Registration succeeded but sign-in failed.');
    return data;
  };

  const login = async (email, password) => {
    const response = await loginApi(email, password);
    const tokenData = response?.data;
    if (!tokenData?.access_token || !tokenData?.refresh_token) {
      throw new Error('Login failed. Please try again.');
    }

    const { data: sessionData, error } = await supabase.auth.setSession({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    });

    if (error) throw new Error(error.message);
    if (!sessionData.session) throw new Error('Login failed to initialize session.');

    return tokenData.user;
  };

  const logout = async () => {
    const accessToken = session?.access_token ?? null;
    if (accessToken) {
      await logoutApi(accessToken);
    }
    await supabase.auth.signOut();
  };

  const value = useMemo(
    () => ({
      user,
      accessToken: session?.access_token ?? null,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      logout,
      register,
    }),
    [user, session, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      accessToken: null,
      isAuthenticated: false,
      initializing: false,
      login: async () => null,
      logout: async () => {},
      register: async () => null,
    };
  }
  return ctx;
}
