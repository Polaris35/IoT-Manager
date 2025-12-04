import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";

import { useRegisterForm } from "../hooks/useRegisterForm";

export default function RegisterForm() {
  const { register, handleSubmit, errors, isSubmitting, serverError } =
    useRegisterForm();

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      {/* Server Error Alert */}
      {serverError && <Alert severity="error">{serverError}</Alert>}

      {/* Full Name Field */}
      <FormControl error={!!errors.fullName}>
        <FormLabel
          htmlFor="fullName"
          sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}
        >
          Full name
        </FormLabel>
        <TextField
          autoComplete="name"
          id="fullName"
          placeholder="Jon Snow"
          required
          fullWidth
          variant="outlined"
          size="small"
          {...register("fullName", {
            required: "Full name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          })}
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
        />
      </FormControl>

      {/* Email Field */}
      <FormControl error={!!errors.email}>
        <FormLabel
          htmlFor="email"
          sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}
        >
          Email
        </FormLabel>
        <TextField
          required
          fullWidth
          id="email"
          placeholder="your@email.com"
          autoComplete="email"
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
        <FormLabel
          htmlFor="password"
          sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}
        >
          Password
        </FormLabel>
        <TextField
          required
          fullWidth
          id="password"
          placeholder="••••••"
          type="password"
          autoComplete="new-password"
          variant="outlined"
          size="small"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
      </FormControl>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
        sx={{ mt: 1 }}
      >
        {isSubmitting ? "Creating account..." : "Sign up"}
      </Button>
    </Box>
  );
}
