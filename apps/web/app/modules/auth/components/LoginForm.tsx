import { Link as RouterLink } from "react-router";

// MUI Components
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";

// Hook
import { useLoginForm } from "../hooks/useLoginForm";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    validationErrors,
    isSubmitting,
    serverError,
  } = useLoginForm();

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
      <FormControl error={!!validationErrors.email}>
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
          {...register("email")}
          error={!!validationErrors.email}
          helperText={validationErrors.email?.message}
        />
        <span className="text-red-500">
          {validationErrors.email?.message || "error"}
        </span>
      </FormControl>

      {/* Password Field */}
      <FormControl error={!!validationErrors.password}>
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
          {...register("password")}
          error={!!validationErrors.password}
          helperText={validationErrors.password?.message}
        />
      </FormControl>

      {/* Forgot Password */}
      <div className="flex items-center justify-between">
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
