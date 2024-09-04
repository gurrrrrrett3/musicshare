import { defineConfig } from "vite";

export default defineConfig({
    root: "client",
    build: {
        target: "esnext",
        outDir: "../dist/client",
        assetsDir: "_",
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: "client/index.html",
        }
    },
    server: {
        open: true,
        proxy: {
            '/api': 'http://localhost:3000'
        }
    }
});