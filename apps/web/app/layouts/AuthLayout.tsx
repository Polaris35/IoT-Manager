import { CssBaseline, Stack, useColorScheme } from "@mui/material";
import { Outlet } from "react-router";
import AppTheme from "~/components/theme/AppTheme";
import ColorModeSelect from "~/components/theme/ColorModeSelect";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen">
      {/* Фон — на самом нижнем уровне */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,102,255,0.4)_0%,transparent_70%)] blur-2xl opacity-80" />

      <AppTheme disableCustomTheme={false}>
        <CssBaseline enableColorScheme />
        {/* Контейнер */}
        <div className="relative z-0 flex flex-col justify-around min-h-full p-4 sm:p-8 h-[calc(100dvh-(var(--template-frame-height,0)*100dvh))]">
          <ColorModeSelect
            sx={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 10 }}
          />
          <Outlet />
        </div>
      </AppTheme>
    </div>
  );
}
