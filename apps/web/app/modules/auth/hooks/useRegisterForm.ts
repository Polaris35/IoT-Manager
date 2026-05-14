import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import type { RegisterAccountDto } from "~/api/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { credentialsRegisterBody } from "~/api/endpoints/auth.zod";
import { useCredentialsRegister } from "~/api/endpoints/auth";

export const useRegisterForm = () => {
  const registerMutation = useCredentialsRegister<Error>({
    mutation: {
      onSuccess: () => {
        navigate("/auth/login");
      },
    },
  });

  const navigate = useNavigate();

  const {
    register, // RHF method
    handleSubmit,
    formState: { errors: validationErrors },
  } = useForm<RegisterAccountDto>({
    resolver: zodResolver(credentialsRegisterBody),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  return {
    register,
    handleSubmit: handleSubmit((data) => registerMutation.mutate({ data })),
    validationErrors,
    isSubmitting: registerMutation.isPending,
    serverError: registerMutation.error?.message || null,
  };
};
