import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

export default function GoogleButton() {
  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={() => alert("Sign in with Google")}
      startIcon={<GoogleIcon />}
    >
      Sign in with Google
    </Button>
  );
}
