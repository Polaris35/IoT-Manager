// app/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";

// Импортируем сгенерированный API и Типы!
import { getAuth } from "~/modules/auth/auth"; // Путь к сгенерированному файлу Orval
import type {
  CredentialsLoginDto,
  RegisterAccountDto,
  // AuthResponse, // Убедись, что этот тип есть в схемах, или используй any временно
} from "../types/schemas";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "~/api/client";

// Нам нужно импортировать утилиты для работы с токенами из client.ts
// Но так как они не экспортированы, давай добавим их экспорт в client.ts или продублируем логику (лучше экспорт)
// ПРЕДПОЛАГАЕМ, что в app/api/client.ts ты добавил export для setTokens/clearTokens
// Если нет - давай просто работать с localStorage здесь, это слой бизнес-логики.
const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};
const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

interface User {
  id: string;
  email: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: CredentialsLoginDto) => Promise<void>;
  register: (data: RegisterAccountDto) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Для проверки токена при загрузке
  const navigate = useNavigate();

  // Проверка авторизации при загрузке страницы
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        // Здесь в идеале нужен запрос /auth/me или декодирование JWT токена
        // Пока просто считаем, что если есть токен - юзер залогинен
        // TODO: Добавить запрос профиля пользователя
        setUser({ id: "temp", email: "user@example.com" });
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (dto: CredentialsLoginDto) => {
    try {
      // Вызываем сгенерированную функцию
      // Orval по умолчанию возвращает data (так как мы настроили apiClient)
      // Если AuthResponse не типизирован в swagger, используй any
      const response = (await getAuth().authControllerCredentialsLogin(
        dto,
      )) as unknown as any;

      // Сохраняем токены (структура зависит от твоего бекенда)
      // Судя по сваггеру, там может быть просто 201 Created.
      // Но обычно бекенд возвращает JSON. Допустим response содержит accessToken.
      if (response?.accessToken) {
        setTokens(response.accessToken, response.refreshToken.token);
        // Устанавливаем юзера (если он приходит в ответе)
        setUser(response.account || { email: dto.email });
        // navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error; // Пробрасываем ошибку, чтобы форма могла её показать
    }
  };

  const register = async (dto: RegisterAccountDto) => {
    await getAuth().authControllerCredentialsRegister(dto);
    // После регистрации можно сразу логинить или редиректить на логин
    navigate("/auth/login");
  };

  const logout = async () => {
    try {
      // Отправляем запрос на бек, чтобы убить рефреш токен
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await getAuth().authControllerLogout({ refreshToken });
      }
    } catch (e) {
      console.error(e);
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
