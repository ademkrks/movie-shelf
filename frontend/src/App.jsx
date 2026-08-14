import {
    Route,
    Routes,
} from "react-router";

import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
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