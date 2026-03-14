import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";
import StepGeneral from "./StepGeneral";

type AddDeviceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};
export default function AddDeviceModal(props: AddDeviceModalProps) {
  const [step, setStep] = useState(0);

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepGeneral onNextStep={() => setStep((prev) => prev + 1)} />;
      default:
        throw new Error("Unknown step in AddDeviceModal");
    }
  };

  const onClose = () => {
    setStep(0);
    props.onClose();
  };
  return (
    <Dialog open={props.isOpen} onClose={onClose}>
      <DialogTitle>Add new device</DialogTitle>
      <DialogContent>{renderStep()}</DialogContent>
    </Dialog>
  );
}
