import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "student";
  avatar?: string;
  referralCode: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "courseflow-users";
const SESSION_KEY = "courseflow-session";

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
}

const SEED_USERS: StoredUser[] = [
  {
    id: "admin-1",
    name: "Admin",
    email: "admin@courseflow.com",
    password: "admin123",
    role: "admin",
    referralCode: "ADMIN001",
  },
];

function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const users = JSON.parse(raw) as StoredUser[];
      // Migrate existing users without referralCode
      return users.map((u) => ({
        ...u,
        referralCode: u.referralCode || generateReferralCode(),
      }));
    }
  } catch {
    /* ignore */
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const u: User = JSON.parse(raw);
        // Ensure referralCode exists
        if (!u.referralCode) {
          u.referralCode = generateReferralCode();
          localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        }
        setUser(u);
      }
    } catch {
      /* ignore */
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const users = getUsers();
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password,
    );
    if (!found) {
      setIsLoading(false);
      throw new Error("Invalid email or password");
    }
    // Ensure referralCode
    if (!found.referralCode) {
      found.referralCode = generateReferralCode();
      saveUsers(users);
    }
    const { password: _p, ...sessionUser } = found;
    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setIsLoading(false);
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 800));
      const users = getUsers();
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        setIsLoading(false);
        throw new Error("Email already in use");
      }
      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role: "student",
        referralCode: generateReferralCode(),
      };
      saveUsers([...users, newUser]);
      const { password: _p, ...sessionUser } = newUser;
      setUser(sessionUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      setIsLoading(false);
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      const users = getUsers();
      const idx = users.findIndex((u) => u.id === prev.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        saveUsers(users);
      }
      return updated;
    });
  }, []);

  const getAllUsers = useCallback((): User[] => {
    const users = getUsers();
    return users.map(({ password: _p, ...u }) => u);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
