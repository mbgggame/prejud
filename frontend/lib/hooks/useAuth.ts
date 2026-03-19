/**
 * Hook useAuth - Mock para PreJud SaaS
 * Autenticacao simplificada para desenvolvimento
 */

import { useState, useEffect } from 'react';

interface User {
  uid: string;
  email: string;
  displayName: string | null;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Mock de usuario autenticado para desenvolvimento
    const mockUser: User = {
      uid: 'dev-user-fixed-001',
      email: 'dev@prejud.com',
      displayName: 'Dev User'
    };
    
    setUser(mockUser);
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    error
  };
}
