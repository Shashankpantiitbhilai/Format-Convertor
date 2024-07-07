import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import FileUpload from "./components/fileUpload.jsx";
import Login from "./components/auth/login.jsx";
import ProtectedRoute from "./protected_user.js";

const Main = () => {
    return (
        <div>
            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <FileUpload />
                        </ProtectedRoute>
                    }
                />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
};

export default Main;
