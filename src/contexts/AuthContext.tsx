// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for the context state
interface AuthContextType {
  user: any; // Replace 'any' with your User type if available
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Temporary function stubs to prevent 'undefined' variables
  const login = () => {};
  const logout = () => {};

  useEffect(() => {
    // 1. Check local storage tokens or backend session on mount
    // 2. Set up active session listeners
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 🟢 ADD THIS HOOK TO FIX THE BUILD ERROR
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
