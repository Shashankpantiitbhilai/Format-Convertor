import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AdminContext } from "./App";
import { CircularProgress, Box } from "@mui/material";

const ProtectedRoute = ({ children }) => {
    const { IsUserLoggedIn, isLoading } = useContext(AdminContext);

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!IsUserLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
