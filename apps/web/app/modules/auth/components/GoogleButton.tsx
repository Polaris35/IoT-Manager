import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "~/context/AuthContext";

export default function GoogleButton() {
  const { googleLoginMutation } = useAuth();

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      googleLoginMutation.mutate({ data: { code: codeResponse.code } });
    },
    onError: (errorResponse) => {
      console.error("Google verification failed:", errorResponse);
    },
  });
  return (
    <Button
      fullWidth
      variant="outlined"
      disabled={googleLoginMutation.isPending}
      onClick={() => googleLogin()}
      startIcon={<GoogleIcon />}
    >
      Sign in with Google
    </Button>
  );
}
