import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "../../images/backgrounds": "uikit/src/images/backgrounds",
            "../../images/icons": "uikit/src/images/icons"
        }
    },
    publicDir: "./public",
    base: "./"
});
