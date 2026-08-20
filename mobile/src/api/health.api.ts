import {
    apiRequest,
} from "./client";


export type HealthResponse = {
    success: boolean;
    status: "ok";
};


export const getHealth =
    async () => {
        return apiRequest<HealthResponse>(
            "/health"
        );
    };