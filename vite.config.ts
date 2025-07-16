import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import rollupNodePolyFill from "rollup-plugin-polyfill-node";

export default defineConfig({
  base: "/copy-utils-generator-webui/",
  plugins: [
    react(),
  ],
  define: {
    "process.env": {}, // 空にしてもいいが、dotenvなどと併用時は要注意
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  resolve: {
    alias: {
      // Node.js core modules polyfill for browser
      stream: "stream-browserify",
      path: "path-browserify",
      process: "process/browser",
      buffer: "buffer",
      config: '/dev/null', // Node.js専用モジュールを無効化
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        rollupNodePolyFill() // ← ここが必要！
      ],
    },
  },
});
