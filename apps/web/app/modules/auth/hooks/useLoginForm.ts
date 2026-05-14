import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { credentialsLoginBody } from "~/api/endpoints/auth.zod";
import type { CredentialsLoginDto } from "~/api/schemas";
import { useAuth } from "~/context/AuthContext";

export const useLoginForm = () => {
  const { credentialsLoginMutation: loginMutation } = useAuth();

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
