import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
// import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  base: "/copy-utils-generator-webui/",
  plugins: [
    react(),
    // nodePolyfills()
  ],
  define: {
    "process.env": {},
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
      ],
    },
  },
  resolve: {
    alias: {
      // Node.js core modules polyfill for browser
      stream: "stream-browserify",
      path: "path-browserify",
      process: "process/browser",
      buffer: "buffer/",
    },
  },
});
