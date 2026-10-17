import { useEffect } from "react";
import { sseService } from "../services/sse.service";

export const useSseConnection = (token: string | null | undefined) => {
  useEffect(() => {
    if (!token) return;

    sseService.connect(token);

    return () => {
      sseService.disconnect();
    };
  }, [token]);
};
