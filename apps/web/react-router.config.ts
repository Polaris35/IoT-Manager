import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  routeDiscovery: {
    mode: "initial",
  },
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
} satisfies Config;
