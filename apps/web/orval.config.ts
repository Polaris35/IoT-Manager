import { defineConfig } from "orval";

export default defineConfig({
  iot: {
    input: {
      target: "http://localhost:3000/api/swagger-json",
    },
    output: {
      mode: "tags",
      target: "app/api/endpoints",
      schemas: "app/api/schemas",
      client: "react-query",
      mock: false,
      override: {
        mutator: {
          path: "./app/api/client.ts",
          name: "apiClient",
        },
      },
      prettier: true,
    },
  },
  iotZod: {
    input: {
      target: "http://localhost:3000/api/swagger-json",
    },
    output: {
      mode: "tags",
      client: "zod",
      target: "app/api/endpoints",
      fileExtension: ".zod.ts",
    },
  },
});
