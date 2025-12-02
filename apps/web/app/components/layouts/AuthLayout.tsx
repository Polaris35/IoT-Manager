import { Outlet } from "react-router";
import ColorModeSelect from "~/theme/ColorModeSelect";

export default function AuthLayout() {
  return (
    // relative нужен, чтобы absolute дети позиционировались относительно этого блока
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* === ФОНОВЫЕ ПЯТНА === */}
      {/* pointer-events-none важен, чтобы клики проходили сквозь фон */}
      {/* z-0 кладем его вниз */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,rgba(0,102,255,0.4)_0%,transparent_70%)] blur-2xl opacity-80" />

      {/* === КОНТЕНТ === */}
      {/* z-10 поднимаем контент над фоном */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen p-4 sm:p-8">
        {/* Переключатель темы оставляем тут, он будет работать, т.к. AppTheme есть в root */}
        <ColorModeSelect
          sx={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 20 }}
        />

        <Outlet />
      </div>
    </div>
  );
}
