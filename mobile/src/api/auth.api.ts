import {
    apiRequest,
} from "./client";

import type {
    ApiResponse,
} from "../types/api";

import type {
    AuthUser,
    LoginData,
    LoginInput,
    RegisterInput,
} from "../types/auth";


export const login =
    async (
        input: LoginInput
    ) => {
        return apiRequest<
            ApiResponse<LoginData>
        >(
            "/auth/login",
            {
                method: "POST",

                auth: false,

                body: JSON.stringify({
                    email:
                        input.email,

                    password:
                        input.password,
                }),
            }
        );
    };


export const register =
    async (
        input: RegisterInput
    ) => {
        return apiRequest<
            ApiResponse<AuthUser>
        >(
            "/auth/register",
            {
                method: "POST",

                auth: false,

                body: JSON.stringify({
                    name:
                        input.name,

                    email:
                        input.email,

                    password:
                        input.password,
                }),
            }
        );
    };


export const getProfile =
    async () => {
        return apiRequest<
            ApiResponse<AuthUser>
        >(
            "/users/me"
        );
    };