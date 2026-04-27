import {
  Button,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  TextField,
} from "@mui/material";
import type { FormDataType } from "./AddDeviceModal";
import { useForm, type Control, type FieldErrors } from "react-hook-form";
import { useEffect } from "react";

type StepConfigProps = {
  defaultValues: FormDataType;
  onNextStep: (data: FormDataType) => void;
  onBack: () => void;
};

export default function StepConfig(props: StepConfigProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: props.defaultValues,
  });
  const protocol = props.defaultValues.profile?.protocol;

  useEffect(() => {
    if (!protocol) {
      props.onBack();
    }
  }, []);

  const renderConfig = () => {
    switch (protocol) {
      case "ZIGBEE":
        return <ZigbeeConfig control={control} errors={errors} />;

      case "DIY":
      case "MQTT":
        return <MqttConfig control={control} errors={errors} />;

      case "TUYA":
        return <TuyaConfig control={control} errors={errors} />;
      default:
        throw new Error(`Unknown protocol {${protocol}} in StepConfig`);
    }
  };
  return (
    <>
      <DialogTitle sx={{ marginLeft: "-24px", marginTop: "-20px" }}>
        Step 2: {protocol} connection Config
      </DialogTitle>
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={handleSubmit((data) => props.onNextStep(data))}
      >
        {renderConfig()}
        <div className="flex justify-between">
          <Button onClick={props.onBack} variant="outlined">
            Back
          </Button>
          <Button type="submit" variant="outlined">
            Next
          </Button>
        </div>
      </form>
    </>
  );
}

function ZigbeeConfig({
  control,
  errors,
}: {
  control: Control<FormDataType, any, FormDataType>;
  errors: FieldErrors<FormDataType>;
}) {
  return (
    <>
      <FormControl>
        <FormLabel>Friendly Name</FormLabel>
        <TextField
          id="friendly-name"
          {...control.register("externalId", { required: true })}
        />
      </FormControl>
      {errors.externalId && (
        <span className="text-red-500">Friendly name is required</span>
      )}
      <FormControl>
        <FormLabel>Topic Prefix</FormLabel>
        <TextField
          id="topic-prefix"
          {...control.register("connectionConfig.topicPrefix", {
            required: false,
          })}
        />
        <FormHelperText>optional</FormHelperText>
      </FormControl>
    </>
  );
}

function MqttConfig({
  control,
  errors,
}: {
  control: Control<FormDataType, any, FormDataType>;
  errors: FieldErrors<FormDataType>;
}) {
  return (
    <>
      <FormControl>
        <FormLabel>Unique Device ID</FormLabel>
        <TextField
          id="unique-device-id"
          placeholder="esp32_garage_01"
          {...control.register("externalId", { required: true })}
        />
      </FormControl>
      {errors.externalId && (
        <span className="text-red-500">Inique device id is required</span>
      )}
      <FormControl>
        <FormLabel>State Topic</FormLabel>
        <TextField
          id="state-topic"
          placeholder="tele/sonoff/SENSOR"
          {...control.register("connectionConfig.stateTopic", {
            required: true,
          })}
        />
      </FormControl>
      {errors.connectionConfig && (
        <span className="text-red-500">state topic is required</span>
      )}
      <FormControl>
        <FormLabel>Command Topic</FormLabel>
        <TextField
          id="command-topic"
          placeholder="tele/sonoff/SENSOR"
          {...control.register("connectionConfig.commandTopic", {
            required: false,
          })}
        />
        <FormHelperText>optional/advance</FormHelperText>
      </FormControl>
    </>
  );
}

function TuyaConfig({
  control,
  errors,
}: {
  control: Control<FormDataType, any, FormDataType>;
  errors: FieldErrors<FormDataType>;
}) {
  return (
    <>
      <FormControl>
        <FormLabel>Device id</FormLabel>
        <TextField
          id="device-id"
          placeholder="vdevo123456789"
          {...control.register("externalId", { required: true })}
        />
      </FormControl>
      {errors.externalId && (
        <span className="text-red-500">device id is required</span>
      )}
      <FormControl>
        <FormLabel>User ID</FormLabel>
        <TextField
          id="user-id"
          {...control.register("connectionConfig.uid", {
            required: false,
          })}
        />
        <FormHelperText>optional</FormHelperText>
      </FormControl>
    </>
  );
}
