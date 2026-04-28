import {
  Alert,
  Button,
  DialogTitle,
  FormControl,
  FormLabel,
  TextField,
} from "@mui/material";
import { useState } from "react";
import SearchSelect from "~/components/SearchSelect";
import { useQuery } from "@tanstack/react-query";
import { searchProfiles } from "~/api/endpoints/profiles";
import { useDebounce } from "use-debounce";
import type { ProfileResponseDto } from "~/api/schemas";
import { Controller, useForm } from "react-hook-form";
import type { FormDataType } from "./AddDeviceModal";

export type StepGeneralProps = {
  defaultValues: FormDataType;
  onNextStep: (data: FormDataType) => void;
};
export default function StepGeneral(props: StepGeneralProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      profile: props.defaultValues.profile || undefined,
      deviceName: props.defaultValues.name || "",
    },
  });

  const [searchInput, setSearchInput] = useState("");
  const [debouncedText] = useDebounce(searchInput, 500);
  const searchQuery = useQuery({
    queryKey: ["searchProfiles", debouncedText],
    queryFn: () => searchProfiles({ q: debouncedText }),
    enabled: searchInput.length > 3,
  });

  const getNoOptionsMessage = () => {
    if (searchInput.length === 0) {
      return "Start typing device model";
    }
    if (searchInput.length < 4) {
      return "Enter at least 4 symbols";
    }

    return "Nothing found";
  };

  return (
    <>
      <DialogTitle sx={{ marginLeft: "-24px", marginTop: "-20px" }}>
        Step 1: General information
      </DialogTitle>
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={handleSubmit((data) => {
          props.onNextStep({
            name: data.deviceName,
            profile: data.profile,
          });
        })}
        noValidate
      >
        <Controller
          name="profile"
          control={control}
          rules={{ required: "Profile is required" }}
          render={({ field: { onChange, value } }) => (
            <SearchSelect
              id="device-profile"
              value={value}
              onChange={(_, newValue) => onChange(newValue)}
              label="Select Device profile"
              noOptionsText={getNoOptionsMessage()}
              options={searchQuery?.data || []}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option: string | ProfileResponseDto) =>
                typeof option === "string" ? option : option.name
              }
              getOptionKey={(option: string | ProfileResponseDto) =>
                typeof option === "string" ? option : option.id
              }
              inputValue={searchInput}
              setInputValue={setSearchInput}
              loading={searchQuery.isLoading}
            />
          )}
        />
        {errors.profile && (
          <Alert severity="warning">{errors.profile.message}</Alert>
        )}

        <FormControl>
          <FormLabel htmlFor="device-name">Device name</FormLabel>
          <TextField
            {...control.register("deviceName", { required: true })}
            id="device-name"
            placeholder="type device name here"
            required
            fullWidth
            size="small"
          />
        </FormControl>
        {errors.deviceName && (
          <Alert severity="warning">Device name is required</Alert>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="outlined">
            Next
          </Button>
        </div>
      </form>
    </>
  );
}
