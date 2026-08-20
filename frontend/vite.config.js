import {
    defineConfig,
    loadEnv,
} from "vite";

import react from "@vitejs/plugin-react";

import {
    cwd,
} from "node:process";


const validateProductionApiUrl = (
    value
) => {
    if (!value) {
        throw new Error(
            "Production ortamında VITE_API_BASE_URL tanımlanmalıdır."
        );
    }

    let parsedUrl;

    try {
        parsedUrl =
            new URL(value);
    } catch {
        throw new Error(
            "VITE_API_BASE_URL geçerli bir URL olmalıdır."
        );
    }

    if (
        parsedUrl.protocol !==
            "http:" &&
        parsedUrl.protocol !==
            "https:"
    ) {
        throw new Error(
            "VITE_API_BASE_URL HTTP veya HTTPS kullanmalıdır."
        );
    }
};


export default defineConfig(
    ({ mode }) => {
        const env =
            loadEnv(
                mode,
                cwd(),
                ""
            );

        const apiBaseUrl =
            env.VITE_API_BASE_URL
                ?.trim();

        /*
         * Production build başlamadan önce
         * backend API adresini doğrular.
         */
        if (
            mode ===
            "production"
        ) {
            validateProductionApiUrl(
                apiBaseUrl
            );
        }

        return {
            plugins: [
                react(),
            ],

            server: {
                port: 3000,
                strictPort: true,
            },
        };
    }
);