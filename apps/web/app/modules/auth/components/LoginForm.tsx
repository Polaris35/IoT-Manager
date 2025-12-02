import { Link as RouterLink } from "react-router";

// MUI Components
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";

// Hook
import { useLoginForm } from "../hooks/useLoginForm";

export default function LoginForm() {
  const { register, handleSubmit, errors, isSubmitting, serverError } =
    useLoginForm();

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col gap-4"
    >
      {/* Server Error Alert */}
      {serverError && (
        <Alert severity="error" className="mb-2">
          {serverError}
        </Alert>
      )}

      {/* Email Field */}
      <FormControl error={!!errors.email}>
        <FormLabel htmlFor="email" className="mb-1 text-sm font-medium">
          Email
        </FormLabel>
        <TextField
          id="email"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          autoFocus
          required
          fullWidth
          variant="outlined"
          size="small"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
      </FormControl>

      {/* Password Field */}
      <FormControl error={!!errors.password}>
        <FormLabel htmlFor="password" className="mb-1 text-sm font-medium">
          Password
        </FormLabel>
        <TextField
          id="password"
          placeholder="••••••"
          type="password"
          autoComplete="current-password"
          required
          fullWidth
          variant="outlined"
          size="small"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 4,
              message: "Password must be at least 4 characters",
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
      </FormControl>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <FormControlLabel
          control={<Checkbox {...register("remember")} color="primary" />}
          label="Remember me"
        />

        <RouterLink
          to="/auth/forgot-password"
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot Password?
        </RouterLink>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
        className="mt-2"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      {/* Sign Up Link */}
      <div className="mt-2 text-center text-sm">
        Don&apos;t have an account?{" "}
        <RouterLink
          to="/auth/register"
          className="font-semibold text-blue-600 hover:underline"
        >
          Sign up
        </RouterLink>
      </div>
    </form>
  );
}
