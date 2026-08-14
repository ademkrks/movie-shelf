import{
    Navigate,
    useLocation,
}from "react-router";

import useAuth from "../hooks/useAuth";

function ProtectedRoute({
    children,
}) {
    const {
        isAuthenticated,
        isLoading,
    }= useAuth();

    const location = useLocation();

    if(isLoading){
        return(
            <div className="route-loading">
                Oturum Kontrol Ediliyor...
            </div>
        );
    }

    if(!isAuthenticated){
        return(
            <Navigate
            to="/login"
            replace
            state={{
                from:location,
            }}
        />
        );
    }

    return children;
}

export default ProtectedRoute;