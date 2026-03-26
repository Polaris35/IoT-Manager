import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";
import StepGeneral from "./StepGeneral";
import type { CreateDeviceDto, ProfileResponseDto } from "~/api/schemas";
import StepConfig from "./StepConfig";

export type AddDeviceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type FormDataType = Partial<Omit<CreateDeviceDto, "profileId">> & {
  profile?: ProfileResponseDto | null;
};
export default function AddDeviceModal(props: AddDeviceModalProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormDataType>({});

  const onNextStep = (data: Partial<CreateDeviceDto>) => {
    setFormData((prev) => {
      return { ...data, ...prev };
    });
    setStep((prev) => prev + 1);
  };

  const onBack = () => {
    setStep((prev) => prev - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepGeneral defaultValues={formData} onNextStep={onNextStep} />;
      case 1:
        return (
          <StepConfig
            defaultValues={formData}
            onNextStep={onNextStep}
            onBack={onBack}
          />
        );
      default:
        throw new Error("Unknown step in AddDeviceModal");
    }
  };

  const onClose = () => {
    setStep(0);
    props.onClose();
  };
  return (
    <Dialog
      open={props.isOpen}
      onClose={onClose}
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: "450px",
          width: "100%",
        },
      }}
    >
      <DialogTitle>Add new device</DialogTitle>
      <DialogContent>{renderStep()}</DialogContent>
    </Dialog>
  );
}
