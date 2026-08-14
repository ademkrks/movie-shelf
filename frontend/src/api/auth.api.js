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


const getProfile = async () => {
    return apiRequest(
        "/users/me"
    );
};


export {
    register,
    login,
    getProfile,
};