import type { FormDataType } from "./AddDeviceModal";
import { Box, Button, DialogTitle, Paper, Typography } from "@mui/material";
import { humanize } from "~/utils/humanize";

type StepSummaryProps = {
  defaultValues: FormDataType;
  onBack: () => void;
};

const PROTOCOL_LABELS: Record<string, string> = {
  ZIGBEE: "Friendly name",
  MQTT: "Unique Device ID",
  TUYA: "Device ID",
};
export default function StepSummary(props: StepSummaryProps) {
  const protocol = props.defaultValues.profile?.protocol;
  const formData = props.defaultValues;
  const externalIdLabel = protocol ? PROTOCOL_LABELS[protocol] : "External ID";
  return (
    <>
      <DialogTitle sx={{ marginLeft: "-24px", marginTop: "-20px" }}>
        Step 3: Confirm
      </DialogTitle>
      <Paper
        variant="outlined"
        sx={{
          bgcolor: "background.default",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",

          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 0 0 1px rgba(255, 255, 255, 0.05)"
              : "none",
        }}
      >
        {/* Header: General */}
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: "action.selected",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
            }}
          >
            Base Configuration
          </Typography>
        </Box>

        <SummaryItem label="Name" value={formData.name} />
        <SummaryItem label={externalIdLabel} value={formData.externalId} />
        <SummaryItem label="Profile" value={formData.profile?.name} />

        {/* Header: Connection (Dynamic) */}
        {Object.keys(formData.connectionConfig || {}).length > 0 && (
          <>
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: "action.selected",
                borderBottom: "1px solid",
                borderTop: "1px solid",
                borderColor: "divider",
                mt: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                }}
              >
                Connection Parameters
              </Typography>
            </Box>
            {formData.connectionConfig &&
              Object.entries(formData.connectionConfig).map(([key, value]) => (
                <SummaryItem key={key} label={humanize(key)} value={value} />
              ))}
          </>
        )}
      </Paper>
      <div className="flex justify-between mt-4">
        <Button onClick={props.onBack} variant="outlined">
          Back
        </Button>
        <Button type="submit" variant="outlined">
          Create
        </Button>
      </div>
    </>
  );
}

interface SummaryItemProps {
  label: string;
  value: string | number | null | undefined;
}

export function SummaryItem({ label, value }: SummaryItemProps) {
  const isNil = value === null || value === undefined || value === "";

  return (
    <div className="flex items-center px-4 py-1.5 font-mono text-[13px] border-b border-white/5 last:border-b-0 odd:bg-white/2 hover:bg-white/4 transition-colors">
      <div className="flex-[0_0_40%] text-gray-500 truncate pr-4 select-none">
        {label}:
      </div>

      <div
        className={`flex-1 break-all select-text ${isNil ? "italic opacity-40" : "text-blue-400"}`}
      >
        {isNil ? "null" : String(value)}
      </div>
    </div>
  );
}
