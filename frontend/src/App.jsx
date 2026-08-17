import {
    Route,
    Routes,
} from "react-router";

import MainLayout from "./layouts/MainLayout";

import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import MovieDetailPage from "./pages/MovieDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

import "./styles/movies.css";


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
                    path="/movie/:id"
                    element={
                        <MovieDetailPage />
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
                    path="/forgot-password"
                    element={
                        <ForgotPasswordPage />
                    }
                />

                <Route
                    path="/reset-password"
                    element={
                        <ResetPasswordPage />
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