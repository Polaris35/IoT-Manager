import { GoogleOAuthProvider } from "@react-oauth/google";
import { Outlet } from "react-router";
import ColorModeSelect from "~/theme/ColorModeSelect";
import { GOOGLE_CLIENT_ID } from "~/constants";

export default function AuthLayout() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* 'relative' is needed for absolute children positioning*/}
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* === BACKGROUND EFFECTS === */}
        {/* pointer-events-none: ensures clicks pass through the background */}
        {/* z-0: places it behind the content */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(0,102,255,0.4)_0%,transparent_70%)] opacity-80 blur-2xl" />

        {/* === CONTENT === */}
        {/* z-10: raises content above the background */}
        <div className="relative z-10 flex min-h-screen flex-col justify-center p-4 sm:p-8">
          {/* Theme switcher fixed at top-right */}
          <ColorModeSelect
            sx={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 20 }}
          />

          <Outlet />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
