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


    const getNavLinkClass =
        ({
            isActive,
        }) =>
            isActive
                ? "nav-link active"
                : "nav-link";


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
                        className={
                            getNavLinkClass
                        }
                    >
                        Home
                    </NavLink>

                    {!isLoading &&
                        isAuthenticated && (
                            <>
                                <NavLink
                                    to="/favorites"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    Favorites
                                </NavLink>

                                <NavLink
                                    to="/watchlist"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    Watchlist
                                </NavLink>

                                <NavLink
                                    to="/profile"
                                    className={
                                        getNavLinkClass
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

                    {!isLoading &&
                        !isAuthenticated && (
                            <>
                                <NavLink
                                    to="/login"
                                    className={
                                        getNavLinkClass
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
                </nav>
            </div>
        </header>
    );
}


export default Navbar;