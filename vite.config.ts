import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

export default defineConfig({
    root: "client",
    build: {
        target: "esnext",
        outDir: "../dist/client",
        assetsDir: "/_",
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: "index.html",
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                assetFileNames: "[name].[ext]",
                sourcemapFileNames: "[name].js.map",
            },
        }
    },
    server: {
        open: true,
        proxy: {
            '/api': 'http://localhost:3000'
        }
    }
});