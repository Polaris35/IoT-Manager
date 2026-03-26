import {
  Autocomplete,
  FormControl,
  FormLabel,
  TextField,
  type AutocompleteProps,
} from "@mui/material";

export interface SearchSelectProps<T>
  extends Omit<AutocompleteProps<T, boolean, boolean, boolean>, "renderInput"> {
  label: string;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
}

export default function SearchSelect<T>(props: SearchSelectProps<T>) {
  const { label, inputValue, setInputValue, ...other } = props;
  return (
    <FormControl>
      <FormLabel className="mb-1 text-sm font-medium">{label}</FormLabel>
      <Autocomplete
        {...other}
        renderInput={(params) => (
          <TextField
            {...params}
            required
            variant="outlined"
            fullWidth
            size="small"
          />
        )}
        fullWidth
        size="small"
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        slotProps={{
          popupIndicator: {
            sx: {
              width: 28,
              height: 28,
              padding: 0,
              borderRadius: "50%",
              border: "none",
              "& .MuiSvgIcon-root": {
                fontSize: "1.2rem",
              },
            },
          },
        }}
      />
    </FormControl>
  );
}
