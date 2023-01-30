import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue'
import VitePluginAutoRoute from "./plugin";
export default defineConfig({
  plugins: [
    vue(),
    VitePluginAutoRoute({
      pagesDir: "src/pages",
      routesDir: "src/router",
    })
  ]
});
