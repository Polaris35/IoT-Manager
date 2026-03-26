import { Button } from "@mui/material";
import type { FormDataType } from "./AddDeviceModal";

type StepConfigProps = {
  defaultValues: FormDataType;
  onNextStep: (data: FormDataType) => void;
  onBack: () => void;
};

export default function StepConfig(props: StepConfigProps) {
  return (
    <form className="flex flex-col gap-4 w-full">
      {/* <p>{JSON.stringify(props.defaultValues)}</p> */}
      <div className="flex justify-between">
        <Button onClick={props.onBack} variant="outlined">
          Back
        </Button>
        <Button type="submit" variant="outlined">
          Next
        </Button>
      </div>
    </form>
  );
}
