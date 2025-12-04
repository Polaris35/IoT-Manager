import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import type { CredentialsLoginDto } from "~/types/schemas";

// UI-specific type extending the API DTO
export type LoginFormInputs = CredentialsLoginDto & {
  remember: boolean;
};

export const useLoginForm = () => {
  const { loginCredentials } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Determine redirect path
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null);
    try {
      // Logic for "Remember Me" can be handled here or in AuthContext
      await loginCredentials({ email: data.email, password: data.password });

      navigate(from, { replace: true });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      setServerError(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit), // Return already wrapped handler
    errors,
    isSubmitting,
    serverError,
  };
};
