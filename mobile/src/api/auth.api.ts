import {
    apiRequest,
} from "./client";

import type {
    ApiResponse,
} from "../types/api";

import type {
    AuthUser,
    ChangePasswordInput,
    ForgotPasswordInput,
    LoginData,
    LoginInput,
    RegisterInput,
    ResetPasswordInput,
    UpdateProfileInput,
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


export const forgotPassword =
    async (
        input:
            ForgotPasswordInput
    ) => {
        return apiRequest<
            ApiResponse<null>
        >(
            "/auth/forgot-password",
            {
                method: "POST",

                auth: false,

                body:
                    JSON.stringify({
                        email:
                            input.email,
                    }),
            }
        );
    };


export const resetPassword =
    async (
        input:
            ResetPasswordInput
    ) => {
        return apiRequest<
            ApiResponse<null>
        >(
            "/auth/reset-password",
            {
                method: "POST",

                auth: false,

                body:
                    JSON.stringify({
                        token:
                            input.token,

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


export const updateProfile =
    async (
        input:
            UpdateProfileInput
    ) => {
        return apiRequest<
            ApiResponse<AuthUser>
        >(
            "/users/me",
            {
                method:
                    "PUT",

                auth: true,

                body:
                    JSON.stringify(
                        input
                    ),
            }
        );
    };


export const changePassword =
    async (
        input:
            ChangePasswordInput
    ) => {
        return apiRequest<
            ApiResponse<null>
        >(
            "/users/change-password",
            {
                method:
                    "PUT",

                auth: true,

                body:
                    JSON.stringify({
                        currentPassword:
                            input.currentPassword,

                        newPassword:
                            input.newPassword,
                    }),
            }
        );
    };