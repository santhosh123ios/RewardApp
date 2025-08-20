
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Define the shape of context
type AuthContextType = {
  isLoggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
  loading: boolean;
  logout: () => Promise<void>;
  userType: number | null;
  setUserType: (val: number | null) => void;
};

// ✅ Default value for createContext
export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  setLoggedIn: () => {},
  loading: true,
  logout: async () => {},
  userType: null,
  setUserType: () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ no error here
  const [userType, setUserType] = useState<number | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const value = await AsyncStorage.getItem('isLoggedIn');
      const storedUserType = await AsyncStorage.getItem('user_type');
      setIsLoggedIn(value === 'true');
      setUserType(storedUserType ? parseInt(storedUserType) : null);
      setLoading(false); // ✅ update loading state after check
    };

    checkLogin();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('user_type');
    setIsLoggedIn(false);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      setLoggedIn: setIsLoggedIn, 
      loading, 
      logout,
      userType,
      setUserType
    }}>
      {children}
    </AuthContext.Provider>
  );
};