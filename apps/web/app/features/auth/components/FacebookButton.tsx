import { Button } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";

export default function FacebookButton() {
  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={() => alert("Sign in with Facebook")}
      startIcon={<FacebookIcon />}
    >
      Sign in with Facebook
    </Button>
  );
}
