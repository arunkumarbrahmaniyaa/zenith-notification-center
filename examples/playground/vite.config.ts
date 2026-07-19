import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Alias the package name to the library source so the example runs against
// live code without needing a publish or build step.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@zenithlogiclabs/react-notification-center": fileURLToPath(
        new URL("../../src/index.ts", import.meta.url)
      )
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
