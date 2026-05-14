import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useCredentialsLogin } from "~/api/endpoints/auth";
import { credentialsLoginBody } from "~/api/endpoints/auth.zod";
import type { CredentialsLoginDto } from "~/api/schemas";

export const useLoginForm = () => {
  const loginMutation = useCredentialsLogin<AxiosError>({
    mutation: {
      onSuccess: () => {
        navigate(from, { replace: true });
      },
    },
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Determine redirect path
  const from = location.state?.from || "/";

  const {
    register,
    handleSubmit,
    formState: { errors: validationErrors },
  } = useForm<CredentialsLoginDto>({
    resolver: zodResolver(credentialsLoginBody),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return {
    register,
    handleSubmit: handleSubmit((data) => loginMutation.mutate({ data })),
    validationErrors,
    isSubmitting: loginMutation.isPending,
    serverError: loginMutation.error?.message,
  };
};
