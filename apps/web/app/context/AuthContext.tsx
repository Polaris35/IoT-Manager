import { AxiosError } from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  getAccountInfo,
  googleLogin,
  useCredentialsLogin,
  useCredentialsRegister,
  useGoogleLogin,
  useLogout,
} from "~/api/endpoints/auth";

// API & Types

import type {
  CredentialsLoginDto,
  GoogleLoginDto,
  RegisterAccountDto,
} from "~/api/schemas";

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
  credentialsLoginMutation: ReturnType<typeof useCredentialsLogin<AxiosError>>;
  googleLoginMutation: ReturnType<typeof useGoogleLogin<AxiosError>>;
  registerCredentialsMutation: ReturnType<
    typeof useCredentialsRegister<AxiosError>
  >;
  logout: () => Promise<void>;
}

// === Context ===

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const logoutMutation = useLogout({
    mutation: {
      onError: (error) => {
        console.warn("Logout API call failed", error);
      },
    },
  });

  const credentialsLoginMutation = useCredentialsLogin<AxiosError>({
    mutation: {
      onSuccess: (data) => {
        if (data?.accessToken) {
          // Save tokens
          storage.set(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
          storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
          // Update State
          setUser(data.account);
        }

        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      },
      onError(error) {
        console.error("credentials login failed: ", error.message);
      },
    },
  });

  const registerCredentialsMutation = useCredentialsRegister<AxiosError>({
    mutation: {
      onSuccess: () => {
        navigate("/auth/login");
      },
      onError: (error) => {
        console.error("Registration failed:", error);
      },
    },
  });

  const googleLoginMutation = useGoogleLogin<AxiosError>({
    mutation: {
      onSuccess: (data) => {
        if (data?.accessToken) {
          // Save tokens
          storage.set(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
          storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
          // Update State
          setUser(data.account);
        }

        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      },
      onError(error) {
        console.error(
          "Exchange google authorization code failed: ",
          error.message,
        );
      },
    },
  });

  // Init Auth (Check token on load)
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);

      if (token) {
        const user = await getAccountInfo();
        setUser(user);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Logout Action
  const logout = async () => {
    const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);
    if (refreshToken) {
      // Fire and forget logout request
      logoutMutation.mutate({ data: { refreshToken } });
    }

    // Always clean up local state
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    setUser(null);
    navigate("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        credentialsLoginMutation,
        googleLoginMutation,
        registerCredentialsMutation,
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
