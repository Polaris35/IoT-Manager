import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "~/context/AuthContext";
import { useLocation, useNavigate } from "react-router";

export default function GoogleButton() {
  const { loginGoogle } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  // Determine redirect path
  const from = location.state?.from?.pathname || "/";

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      await loginGoogle({ code: codeResponse.code });
      navigate(from, { replace: true });
    },
    onError: (errorResponse) => {
      console.error("Google Login Failed:", errorResponse);
    },
  });
  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={() => googleLogin()}
      startIcon={<GoogleIcon />}
    >
      Sign in with Google
    </Button>
  );
}
