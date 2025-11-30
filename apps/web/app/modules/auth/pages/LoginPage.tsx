import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import MuiCard from "@mui/material/Card";
import { FacebookButton, GoogleButton, LoginForm } from "~/modules/auth";

export default function LoginPage() {
  return (
    <MuiCard
      variant="outlined"
      className="z-2 flex flex-col self-center w-full p-6 gap-4 mx-auto sm:max-w-[450px] shadow-[0_5px_15px_0_hsla(220,30%,5%,0.05),0_15px_35px_-5px_hsla(220,25%,10%,0.05)] data-[theme=dark]:shadow-[0_5px_15px_0_hsla(220,30%,5%,0.5),0_15px_35px_-5px_hsla(220,25%,10%,0.08)]"
    >
      {/* <SitemarkIcon /> */}
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
      >
        Sign in
      </Typography>

      <LoginForm />

      <Divider>or</Divider>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <GoogleButton />
        <FacebookButton />

        <Typography sx={{ textAlign: "center" }}>
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            variant="body2"
            sx={{ alignSelf: "center" }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
    </MuiCard>
  );
}
