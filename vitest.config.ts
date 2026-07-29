import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    // "server-only" throws unconditionally under plain Node (its guard
    // relies on the bundler's "browser" package.json condition, which
    // Vitest doesn't apply) — stubbed to a no-op so modules tagged
    // "server-only" for the Next.js client/server boundary can still be
    // imported here for their pure, non-DB-touching exports.
    alias: {
      "server-only": new URL("./test/server-only-stub.ts", import.meta.url).pathname,
    },
  },
});
