import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import type { RegisterAccountDto } from "~/types/schemas";

export const useRegisterForm = () => {
  const { register: registerUser } = useAuth(); // Rename to avoid conflict with RHF
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate = useNavigate();

  const {
    register, // RHF method
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterAccountDto>({
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  const onSubmit = async (data: RegisterAccountDto) => {
    setServerError(null);
    try {
      await registerUser(data);
      navigate("/auth/login", {
        state: { message: "Registration successful! Please log in." },
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setServerError(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    serverError,
  };
};
