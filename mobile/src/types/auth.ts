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


export type SessionStatus =
    | "restoring"
    | "authenticated"
    | "guest"
    | "unavailable";