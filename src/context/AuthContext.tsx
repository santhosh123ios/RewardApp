
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Define the shape of context
type AuthContextType = {
  isLoggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
  loading: boolean;
};

// ✅ Default value for createContext
export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  setLoggedIn: () => {},
  loading: true,
});

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ no error here

  useEffect(() => {
    const checkLogin = async () => {
      const value = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(value === 'true');
      setLoading(false); // ✅ update loading state after check
    };

    checkLogin();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setLoggedIn: setIsLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
};