import {
    Route,
    Routes,
} from "react-router";

import MainLayout from "./layouts/MainLayout";

import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";


function App() {
    return (
        <Routes>
            <Route
                element={
                    <MainLayout />
                }
            >
                <Route
                    path="/"
                    element={
                        <HomePage />
                    }
                />

                <Route
                    path="/login"
                    element={
                        <LoginPage />
                    }
                />

                <Route
                    path="/register"
                    element={
                        <RegisterPage />
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="*"
                    element={
                        <NotFoundPage />
                    }
                />
            </Route>
        </Routes>
    );
}


export default App;