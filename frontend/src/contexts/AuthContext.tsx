import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export type UserRole = 'user' | 'admin';

interface User {
  id: string;
  username: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean | null;
  user: User | null;
  role: UserRole | null;
  setIsAuthenticated: (value: boolean) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    const token = localStorage.getItem('token');
    return token ? null : false;
  });

  const [user, setUser] = useState<User | null>(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        // Ensure role field exists
        if (parsed && typeof parsed.role === 'string') {
          return parsed as User;
        }
        return null;
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          setUser(data.data);
          localStorage.setItem('user', JSON.stringify(data.data));
        } else {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    };
    checkAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        role: user?.role || null,
        setIsAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};