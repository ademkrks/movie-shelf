export type AuthUser = {
    id: number;

    name: string;

    email: string;

    createdAt: string;
};


export type LoginInput = {
    email: string;

    password: string;
};


export type LoginData = {
    user: AuthUser;

    token: string;
};


export type RegisterInput = {
    name: string;

    email: string;

    password: string;
};


export type ForgotPasswordInput = {
    email: string;
};


export type ResetPasswordInput = {
    token: string;

    password: string;
};


export type UpdateProfileInput = {
    name?: string;

    email?: string;
};


export type ChangePasswordInput = {
    currentPassword: string;

    newPassword: string;
};


export type SessionStatus =
    | "restoring"
    | "authenticated"
    | "guest"
    | "unavailable";