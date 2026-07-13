import { Box, Card, CardContent, Divider, Skeleton } from "@mui/material";
import { memo } from "react";

export const DeviceCardSkeleton = memo(function () {
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
          <Skeleton variant="text" width={100} sx={{ fontSize: "0.75rem" }} />
          <Skeleton variant="circular" width={12} height={12} />
        </Box>

        <Divider />

        <Skeleton variant="text" sx={{ fontSize: "0.75rem" }} />

        <div className="flex flex-col gap-2">
          <Skeleton variant="rounded" width={"100%"} height={25} />
          <Skeleton variant="rounded" width={"100%"} height={25} />
        </div>
        {/* graphic */}
        <Skeleton variant="rectangular" width={"100%"} height={120} />
        <Divider />
        {/* footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Skeleton variant="text" width={"50%"} sx={{ fontSize: "0.7rem" }} />
          <Skeleton variant="rounded" width={30} height={30} />
        </Box>
      </CardContent>
    </Card>
  );
});
