import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: { charset: "utf8" },
  plugins: [
    monkey({
      entry: "src/main.ts",
      build: { fileName: "ddd.user.js", externalGlobals: {} },
      userscript: {
        name: "低端影视-下载",
        author: "mission522",
        license: "MIT",
        version: "0.0.1",
        icon: "https://ddys.tv/favicon-32x32.png",
        namespace: "https://github.com/Mrbunker/ddrk-download",
        description: "低端影视-下载",
        match: ["*://*.ddys.tv/*", "*://*.ddys2.me/*"],
      },
    }),
  ],
});
