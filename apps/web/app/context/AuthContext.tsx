import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";

// API & Types
import { getAuth } from "~/modules/auth/auth";
import type {
  CredentialsLoginDto,
  GoogleLoginDto,
  RegisterAccountDto,
} from "~/types/schemas";

// Utils
import { STORAGE_KEYS } from "~/constants";
import { storage } from "~/utils/storage";

// === Types ===

export interface User {
  id: string;
  email: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginCredentials: (data: CredentialsLoginDto) => Promise<void>;
  loginGoogle(data: GoogleLoginDto): Promise<void>;
  register: (data: RegisterAccountDto) => Promise<void>;
  logout: () => Promise<void>;
}

// === Context ===

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Init Auth (Check token on load)
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);

      if (token) {
        const user = await getAuth().authControllerAccountInfo();
        setUser(user);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login Action
  const loginCredentials = async (dto: CredentialsLoginDto) => {
    try {
      const response = await getAuth().authControllerCredentialsLogin(dto);

      if (response?.accessToken) {
        // Save tokens
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

        // Update State
        setUser(response.account);
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw so the UI can show an error message
    }
  };

  const loginGoogle = async (dto: GoogleLoginDto) => {
    try {
      const response = await getAuth().authControllerGoogleLogin(dto);

      if (response?.accessToken) {
        // Save tokens
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

        // Update State
        setUser(response.account);
      }
    } catch (error) {
      console.error("Google Login failed:", error);
      throw error; // Re-throw so the UI can show an error message
    }
  };

  // Register Action
  const register = async (dto: RegisterAccountDto) => {
    try {
      await getAuth().authControllerCredentialsRegister(dto);
      navigate("/auth/login");
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  // Logout Action
  const logout = async () => {
    try {
      const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        // Fire and forget logout request
        await getAuth().authControllerLogout({ refreshToken });
      }
    } catch (error) {
      console.warn("Logout API call failed", error);
    } finally {
      // Always clean up local state
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      setUser(null);
      navigate("/auth/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginCredentials,
        loginGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// === Hook ===

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
