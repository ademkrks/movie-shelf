import {
    createContext,
} from "react";

import type {
    AuthUser,
    LoginInput,
    SessionStatus,
} from "../types/auth";


export type AuthContextValue = {
    user:
        AuthUser | null;

    sessionStatus:
        SessionStatus;

    sessionError:
        string | null;

    isAuthenticated:
        boolean;

    isRestoring:
        boolean;

    login: (
        input: LoginInput
    ) => Promise<AuthUser>;

    logout:
        () => Promise<void>;

    restoreSession:
        () => Promise<void>;

    refreshProfile:
        () => Promise<AuthUser>;
};


export const AuthContext =
    createContext<
        AuthContextValue | undefined
    >(
        undefined
    );