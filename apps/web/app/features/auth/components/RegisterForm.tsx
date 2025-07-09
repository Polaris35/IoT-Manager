import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";

export default function RegisterForm() {
  return (
    <Box
      component="form"
      // onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <FormControl>
        <FormLabel htmlFor="name">Full name</FormLabel>
        <TextField
          autoComplete="name"
          name="name"
          required
          fullWidth
          id="name"
          placeholder="Jon Snow"
          // error={nameError}
          // helperText={nameErrorMessage}
          // color={nameError ? "error" : "primary"}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="email">Email</FormLabel>
        <TextField
          required
          fullWidth
          id="email"
          placeholder="your@email.com"
          name="email"
          autoComplete="email"
          variant="outlined"
          // error={emailError}
          // helperText={emailErrorMessage}
          // color={emailError ? "error" : "primary"}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="password">Password</FormLabel>
        <TextField
          required
          fullWidth
          name="password"
          placeholder="••••••"
          type="password"
          id="password"
          autoComplete="new-password"
          variant="outlined"
          // error={passwordError}
          // helperText={passwordErrorMessage}
          // color={passwordError ? "error" : "primary"}
        />
      </FormControl>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        //   onClick={validateInputs}
      >
        Sign up
      </Button>
    </Box>
  );
}
