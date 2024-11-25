// context/AuthContext.tsx
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: any) => {
  const [authData, setAuthData] = useState({ loginId: '', password: '', scannedData: null });

  const setAuth = (data: any) => setAuthData(data);

  return (
    <AuthContext.Provider value={{ authData, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
