// app/modules/auth/components/LoginForm.tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";

// MUI Components
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";

// Logic
import { useAuth } from "~/context/AuthContext";
import type { CredentialsLoginDto } from "~/types/schemas";

// Расширяем DTO, так как в форме есть поле "remember", которого нет на бекенде
type LoginFormInputs = CredentialsLoginDto & {
  remember: boolean;
};

export default function LoginForm() {
  const { login } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: "",
      password: "",
      remember: true, // По умолчанию "запомнить меня" включено
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null);
    try {
      // Здесь можно добавить логику: если !data.remember, то не сохранять в localStorage
      // Но пока просто передаем данные на сервер
      await login({ email: data.email, password: data.password });
      navigate(from, { replace: true });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      setServerError(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col w-full gap-4"
    >
      {/* Блок ошибки сервера */}
      {serverError && (
        <Alert severity="error" className="mb-2">
          {serverError}
        </Alert>
      )}

      {/* Поле Email */}
      <FormControl error={!!errors.email}>
        <FormLabel htmlFor="email" className="mb-1 text-sm font-medium">
          Email
        </FormLabel>
        <TextField
          id="email"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          autoFocus
          required
          fullWidth
          variant="outlined"
          // Подключаем react-hook-form
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
          // Tailwind классы можно добавлять прямо в InputProps, если нужно стилизовать инпут
          size="small" // Делаем поле чуть компактнее, как в современных UI
        />
      </FormControl>

      {/* Поле Password */}
      <FormControl error={!!errors.password}>
        <FormLabel htmlFor="password" className="mb-1 text-sm font-medium">
          Password
        </FormLabel>
        <TextField
          id="password"
          placeholder="••••••"
          type="password"
          autoComplete="current-password"
          required
          fullWidth
          variant="outlined"
          size="small"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 4,
              message: "Password must be at least 4 characters",
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
      </FormControl>

      {/* Чекбокс и ссылка "Забыли пароль" в одной строке */}
      <div className="flex justify-between items-center">
        <FormControlLabel
          control={<Checkbox {...register("remember")} color="primary" />}
          label="Remember me"
        />

        {/* Ссылка на восстановление (опционально) */}
        <RouterLink
          to="/auth/forgot-password"
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot Password?
        </RouterLink>
      </div>

      {/* Кнопка отправки */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
        // Tailwind margin top если нужно отодвинуть кнопку
        className="mt-2"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      {/* Ссылка на регистрацию */}
      <div className="text-center text-sm mt-2">
        Don&apos;t have an account?{" "}
        <RouterLink
          to="/auth/register"
          className="font-semibold text-blue-600 hover:underline"
        >
          Sign up
        </RouterLink>
      </div>
    </form>
  );
}
