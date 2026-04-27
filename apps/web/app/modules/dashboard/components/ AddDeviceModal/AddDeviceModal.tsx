import { Dialog, DialogContent } from "@mui/material";
import { useState } from "react";
import StepGeneral from "./StepGeneral";
import type { CreateDeviceDto, CreateDeviceDtoProtocol } from "~/api/schemas";
import StepConfig from "./StepConfig";
import StepSummary from "./StepSummary";
import { devicesControllerCreateDevice } from "~/api/endpoints/devices";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { devicesControllerCreateDeviceBody } from "~/api/endpoints/devices.zod";
import z from "zod";

export type AddDeviceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FromDataSchema = devicesControllerCreateDeviceBody
  .omit({
    profileId: true,
  })
  .safeExtend({
    profile: z.object({
      id: z.string(),
      name: z.enum(["MQTT", "ZIGBEE", "TUYA"]),
      vendor: z.string(),
      protocol: z.string(),
      description: z.string().optional(),
    }),
  });
export type FormDataType = Partial<z.infer<typeof FromDataSchema>>;

export default function AddDeviceModal(props: AddDeviceModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormDataType>({});
  const [finalErrors, setFinalErrors] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateDeviceDto) => {
      return devicesControllerCreateDevice(dto);
    },
    onError: (error) => {
      setFinalErrors([error.message]);
    },

    onSuccess: () => {
      // TODO: Add devices list query key
      queryClient.invalidateQueries({ queryKey: [""] });
      toast.success("Device was added successfully! :)");
      onClose();
      onClose();
    },
  });

  const onNextStep = (data: Partial<CreateDeviceDto>) => {
    setFormData((prev) => {
      return { ...data, ...prev };
    });
    setStep((prev) => prev + 1);
  };

  const handleFinalSubmit = () => {
    const { profile, ...dataWithoutProfile } = formData;
    //Partial for disable undefined and null errors
    const deviceDto: Partial<CreateDeviceDto> = {
      ...dataWithoutProfile,
      profileId: formData.profile?.id as string,
      protocol: profile?.protocol as CreateDeviceDtoProtocol,
    };
    setFinalErrors([]);
    try {
      devicesControllerCreateDeviceBody.parse(deviceDto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((issue) => {
          const field = issue.path.join(".");
          return `${field}: ${issue.message}`;
        });
        setFinalErrors(errorMessages);
      }
    }
    if (finalErrors.length === 0) {
      mutate(deviceDto as CreateDeviceDto);
    }
  };

  const onBack = () => {
    setStep((prev) => prev - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepGeneral defaultValues={formData} onNextStep={onNextStep} />;
      case 2:
        return (
          <StepConfig
            defaultValues={formData}
            onNextStep={onNextStep}
            onBack={onBack}
          />
        );
      case 3:
        return (
          <StepSummary
            defaultValues={formData}
            onBack={onBack}
            onConfirm={handleFinalSubmit}
            isPending={isPending}
            error={finalErrors}
          />
        );
      default:
        throw new Error("Unknown step in AddDeviceModal");
    }
  };

  const onClose = () => {
    setStep(1);
    setFormData({});
    setFormData({});
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
      <DialogContent>{renderStep()}</DialogContent>
    </Dialog>
  );
}
