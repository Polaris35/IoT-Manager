import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";
import StepGeneral from "./StepGeneral";
import type {
  CreateDeviceDto,
  CreateDeviceDtoProtocol,
  ProfileResponseDto,
} from "~/api/schemas";
import StepConfig from "./StepConfig";
import StepSummary from "./StepSummary";
import { devicesControllerCreateDevice } from "~/api/endpoints/devices";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export type AddDeviceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type FormDataType = Partial<Omit<CreateDeviceDto, "profileId">> & {
  profile?: ProfileResponseDto | null;
};

export default function AddDeviceModal(props: AddDeviceModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormDataType>({});

  const queryClient = useQueryClient();

  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: (dto: CreateDeviceDto) => {
      return devicesControllerCreateDevice(dto);
    },

    onSuccess: () => {
      // TODO: Add devices list query key
      queryClient.invalidateQueries({ queryKey: [""] });
      toast.success("Device was added successfully! :)");

      // 1. Закрываем модалку
      // 2. Инвалидируем кэш react-query (чтобы список устройств обновился)
      // 3. Показываем уведомление (Toast/Snackbar)
    },
  });

  const onNextStep = (data: Partial<CreateDeviceDto>) => {
    setFormData((prev) => {
      return { ...data, ...prev };
    });
    setStep((prev) => prev + 1);
  };

  const handleFinalSubmit = () => {
    // Простая валидация перед отправкой
    if (!formData.name || !formData.externalId || !formData.profile?.id) {
      return; // Можно добавить локальный стейт ошибки для Summary
    }

    // Трансформация из UI-типа в DTO для сервера
    const payload: CreateDeviceDto = {
      name: formData.name,
      externalId: formData.externalId,
      profileId: formData.profile.id,
      connectionConfig: formData.connectionConfig || {},
      protocol: formData.profile.protocol as CreateDeviceDtoProtocol,
    };

    mutate(payload);
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
            onConfirm={() => {
              console.log("result: ", formData);
            }}
            isPending={false}
            error={null}
          />
        );
      default:
        throw new Error("Unknown step in AddDeviceModal");
    }
  };

  const onClose = () => {
    setStep(1);
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
