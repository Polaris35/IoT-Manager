import { defineConfig } from "orval";

export default defineConfig({
  iot: {
    input: {
      // Путь к swagger файлу (локальный или URL)
      target: "http://localhost:3000/api/swagger-json",
    },
    output: {
      mode: "tags-split",
      target: "app/modules",
      schemas: "app/types/schemas",
      client: "axios",
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
});
