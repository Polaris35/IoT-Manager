import { Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import SearchSelect from "~/components/SearchSelect";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getProfiles } from "~/api/endpoints/profiles";
import { useDebounce } from "use-debounce";

const { profilesControllerSearchProfiles: SearchProfiles } = getProfiles();

export type StepGeneralProps = {
  onNextStep: () => void;
};
export default function StepGeneral(props: StepGeneralProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedText] = useDebounce(searchInput, 500);
  const searchQuery = useQuery({
    queryKey: ["searchProfiles", debouncedText],
    queryFn: () => SearchProfiles({ q: debouncedText }),
    enabled: searchInput.length > 3,
  });

  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={props.onNextStep}
      noValidate
    >
      <SearchSelect
        label={"Select Device profile"}
        noOptionsText="other"
        options={[""]}
        onChange={function (): void {
          throw new Error("Function not implemented.");
        }}
        loading={searchQuery.isLoading}
        inputValue={searchInput}
        setInputValue={setSearchInput}
      />
      <div className="mt-2">
        <TextField label="Name" placeholder="type device name here" required />
        <TextField label="group" helperText="optional" />
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="outlined" onClick={props.onNextStep}>
          Next
        </Button>
      </div>
    </form>
  );
}
