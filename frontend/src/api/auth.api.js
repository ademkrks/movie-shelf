import {
    apiRequest,
} from "./client";


const register = async ({
    name,
    email,
    password,
}) => {
    return apiRequest(
        "/auth/register",
        {
            method: "POST",

            body: JSON.stringify({
                name,
                email,
                password,
            }),
        }
    );
};


const login = async ({
    email,
    password,
}) => {
    return apiRequest(
        "/auth/login",
        {
            method: "POST",

            body: JSON.stringify({
                email,
                password,
            }),
        }
    );
};


const forgotPassword = async ({
    email,
}) => {
    return apiRequest(
        "/auth/forgot-password",
        {
            method: "POST",

            body: JSON.stringify({
                email,
            }),
        }
    );
};


const resetPassword = async ({
    token,
    password,
}) => {
    return apiRequest(
        "/auth/reset-password",
        {
            method: "POST",

            body: JSON.stringify({
                token,
                password,
            }),
        }
    );
};


const getProfile = async () => {
    return apiRequest(
        "/users/me"
    );
};


export {
    register,
    login,
    forgotPassword,
    resetPassword,
    getProfile,
};