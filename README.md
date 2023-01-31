# vite-plugin-auto-route

A vite plugin for auto generate route.

## Install

```bash
npm i vite-plugin-auto-route -D
```

## Usage

```js
// vite.config.js
import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue'
import VitePluginAutoRoute from "vite-plugin-auto-route";
export default defineConfig({
  plugins: [
    vue(),
    VitePluginAutoRoute({
      pagesDir: "src/pages",
      routesDir: "src/router",
    })
  ]
});

```

### Options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| pagesDir | string | `src/pages` | The directory where the page is located |
| routesDir | string | `src/router` | The directory where the route is located |
| templatePath | string | `index.vue` | The file name of the page |
| getFilesInfo | string | `/files/info` | Get the file information under pagesDir API |
| postRoute | string | `/add/route` | Add route API |
