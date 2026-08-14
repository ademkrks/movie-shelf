import {
    useContext,
} from "react";

import {
    AuthContext,
} from "../context/AuthContext";


const useAuth = () => {
    const context =
        useContext(
            AuthContext
        );


    if (!context) {
        throw new Error(
            "useAuth yalnızca AuthProvider içinde kullanılabilir."
        );
    }


    return context;
};


export default useAuth;