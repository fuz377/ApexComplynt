import { createContext, useContext } from 'react';
import { UseAuthReturn } from '../useAuth';

export const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};