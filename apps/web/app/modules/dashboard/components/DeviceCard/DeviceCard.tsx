import {
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import MenuIcon from "@mui/icons-material/Menu";
import { MetricBadge } from "../MetricsBudge/MetricBadge";
import type { ProfileMappingDef } from "~/types/profile";

export type DeviceCardProps = {
  deviceName: string;
  lastSeeing: string;
  isActive: boolean;
  group?: string;
  profileMappings?: Record<string, ProfileMappingDef>;

  activeMetric: string | null;
  onMetricClick: (name: string) => void;
  metrics: Record<string, number | string>;
  graphicsData: graphicDataType[];
};

type graphicDataType = {
  timestamp: number;
  value: number;
};

export function DeviceCard(props: DeviceCardProps) {
  const statusColor = props.isActive ? "bg-green-500" : "bg-red-500";
  const hasMetricsData = props.graphicsData.length > 0;
  return (
    <Card sx={{ width: "100%", maxWidth: 320, borderRadius: 3, boxShadow: 3 }}>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          p: 2,
          "&:last-child": { pb: 2 },
        }}
      >
        {/* header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="subtitle1"
            noWrap
            sx={{ fontWeight: "bold", color: "text.primary" }}
          >
            {props.deviceName}
          </Typography>
          <div className={`h-3 w-3 rounded-full ${statusColor}`} />
        </Box>

        <Divider />

        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block" }}
        >
          Last seen: {props.lastSeeing}
        </Typography>

        <DeviceMetricsList
          metrics={props.metrics}
          activeMetric={props.activeMetric}
          onMetricClick={props.onMetricClick}
          profileMappings={props.profileMappings}
        />

        {/* graphic */}
        <Box sx={{ width: "100%", height: 120, mt: 1 }}>
          {hasMetricsData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={props.graphicsData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "12px" }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPv)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p>Click the metric to view the chart</p>
            </div>
          )}
        </Box>
        <Divider />
        {/* footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block" }}
          >
            Group: {props.group ? props.group : "unassigned"}
          </Typography>
          <IconButton size="small">
            <MenuIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}

interface DeviceMetricsListProps {
  metrics: Record<string, number | string>;
  activeMetric: string | null;
  profileMappings?: Record<string, ProfileMappingDef>;
  onMetricClick: (metricName: string) => void;
}

export function DeviceMetricsList(props: DeviceMetricsListProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        alignItems: "stretch",
        width: "100%",

        maxHeight: 150,
        overflowY: "auto",
        p: 0.5,
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.1)",
          borderRadius: "4px",
        },
      }}
    >
      {Object.entries(props.metrics).map(([name, value]) => {
        if (name === "lastSeen") {
          return;
        }
        return (
          <button key={name} onClick={() => props.onMetricClick(name)}>
            <MetricBadge
              metricKey={name}
              value={value}
              backendDef={
                props.profileMappings ? props.profileMappings[name] : undefined
              }
            />
          </button>
        );
      })}
    </Box>
  );
}
