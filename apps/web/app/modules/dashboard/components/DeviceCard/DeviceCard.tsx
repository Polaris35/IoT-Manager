import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import MenuIcon from "@mui/icons-material/Menu";

export type DeviceCardProps = {
  deviceName: string;
  lastSeeing: string;
  isActive: boolean;
  group?: string;

  activeMetric: string | null;
  onMetricClick: (name: string) => void;
  metrics: MetricType[];
  graphicsData: graphicDataType[];
};

type graphicDataType = {
  timestamp: number;
  value: number;
};

type MetricType = {
  name: string;
  value: number | string;
  unit?: string;
};

export function DeviceCard(props: DeviceCardProps) {
  const statusColor = props.isActive ? "bg-green-500" : "bg-red-500";

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
        />

        {/* graphic */}
        <Box sx={{ width: "100%", height: 120, mt: 1 }}>
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
  metrics: MetricType[];
  activeMetric: string | null;
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

        maxHeight: 120,
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
      {props.metrics.map((item) => {
        const isActive = props.activeMetric === item.name;

        return (
          <Button
            key={item.name}
            onClick={() => props.onMetricClick(item.name)}
            variant={isActive ? "contained" : "outlined"}
            color={isActive ? "primary" : "inherit"}
            sx={{
              justifyContent: "space-between",
              textTransform: "none",
              borderRadius: 2,
              p: 1.5,
              flexShrink: 0,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {item.name}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {item.value} {item.unit || ""}
            </Typography>
          </Button>
        );
      })}
    </Box>
  );
}
