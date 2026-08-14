import {
    NavLink,
    useNavigate,
} from "react-router";

import useAuth from "../hooks/useAuth";


function Navbar() {
    const navigate =
        useNavigate();

    const {
        user,
        isAuthenticated,
        isLoading,
        logout,
    } = useAuth();


    const handleLogout = () => {
        logout();

        navigate("/");
    };


    return (
        <header className="navbar">
            <div className="navbar-container">
                <NavLink
                    to="/"
                    className="brand"
                >
                    MovieShelf
                </NavLink>

                <nav className="nav-links">
                    <NavLink
                        to="/"
                        className={({
                            isActive,
                        }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        Home
                    </NavLink>

                    {!isLoading &&
                        !isAuthenticated && (
                            <>
                                <NavLink
                                    to="/login"
                                    className={({
                                        isActive,
                                    }) =>
                                        isActive
                                            ? "nav-link active"
                                            : "nav-link"
                                    }
                                >
                                    Login
                                </NavLink>

                                <NavLink
                                    to="/register"
                                    className={({
                                        isActive,
                                    }) =>
                                        isActive
                                            ? "nav-link nav-link-primary active"
                                            : "nav-link nav-link-primary"
                                    }
                                >
                                    Register
                                </NavLink>
                            </>
                        )}

                    {!isLoading &&
                        isAuthenticated && (
                            <>
                                <NavLink
                                    to="/profile"
                                    className={({
                                        isActive,
                                    }) =>
                                        isActive
                                            ? "nav-link active"
                                            : "nav-link"
                                    }
                                >
                                    {user?.name ||
                                        "Profile"}
                                </NavLink>

                                <button
                                    type="button"
                                    className="nav-link logout-button"
                                    onClick={
                                        handleLogout
                                    }
                                >
                                    Logout
                                </button>
                            </>
                        )}
                </nav>
            </div>
        </header>
    );
}


export default Navbar;