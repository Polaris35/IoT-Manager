import { GoogleOAuthProvider } from "@react-oauth/google";
import { Outlet } from "react-router";
import ColorModeSelect from "~/theme/ColorModeSelect";
import { GOOGLE_CLIENT_ID } from "~/constants";

export default function AuthLayout() {
  return (
    <OptionalGoogleOAuth>

      <div className="relative min-h-screen w-full overflow-hidden">
        {/* === BACKGROUND EFFECTS === */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(0,102,255,0.4)_0%,transparent_70%)] opacity-80 blur-2xl" />

        {/* === CONTENT === */}
        <div className="relative z-10 flex min-h-screen flex-col justify-center p-4 sm:p-8">
          <ColorModeSelect
            sx={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 20 }}
          />

          <Outlet />
        </div>
      </div>
    </OptionalGoogleOAuth>
  );
}

const OptionalGoogleOAuth = ({ children }: { children: React.ReactNode }) => {
  if (!GOOGLE_CLIENT_ID) return <>{children}</>;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
};
