import React, { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { getMetricConfig } from "./config/metricsRegistry";

interface MetricBadgeProps {
  metricKey: string;
  value: any;
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({
  metricKey,
  value,
}) => {
  // Получаем готовый к употреблению конфиг (иконка + цвета + отформатированная строка)
  const config = getMetricConfig(metricKey);
  const Icon = config.icon;
  const formattedValue = config.format(value);

  // Анимация пульсации (осталась без изменений)
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsUpdating(true);
    const timer = setTimeout(() => setIsUpdating(false), 500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: isUpdating ? config.mainColor : "grey.200",
        backgroundColor: "background.paper",
        transform: isUpdating ? "scale(1.02)" : "scale(1)",
        boxShadow: isUpdating ? `0 0 10px ${config.mainColor}40` : "none",
        transition: "all 0.3s ease-out",
        flexShrink: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 1,
          borderRadius: 1.5,
          backgroundColor: config.bgColor,
          color: config.mainColor,
        }}
      >
        <Icon fontSize="small" />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            textTransform: "uppercase",
            fontWeight: "bold",
            fontSize: "0.65rem",
          }}
        >
          {config.label}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: "bold", color: "text.primary" }}
        >
          {formattedValue}
        </Typography>
      </Box>
    </Paper>
  );
};
