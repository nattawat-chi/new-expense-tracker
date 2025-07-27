"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any;
  isLoaded: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoaded: false,
  isAuthenticated: false,
  isLoading: true,
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      if (!isLoaded) return;

      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // ตรวจสอบ token
        const token = await getToken();
        if (!token) {
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    };

    validateAuth();
  }, [user, isLoaded, getToken]);

  const value = {
    user,
    isLoaded,
    isAuthenticated: !!user && !isLoading,
    isLoading: !isLoaded || isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
