import React, { useContext, useState, useEffect } from "react";
import { AdminContext } from "../../App";
import { Button, Container, Box, Typography, Alert } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";

const LoginContainer = styled(Container)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});

const LoginForm = styled(Box)({
  width: "100%",
  maxWidth: "400px",
  padding: "20px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  borderRadius: "8px",
  backgroundColor: "#fff",
  textAlign: "center",
});

function Login() {
  const { IsUserLoggedIn, setIsUserLoggedIn } = useContext(AdminContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const backendUrl =
    process.env.NODE_ENV === "production"
      ? "https://formatconvertorbackend-shashank-pants-projects.vercel.app"
      : "http://localhost:5000";
console.log(backendUrl)
  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/auth/google`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get("auth_success");
    const userInfo = urlParams.get("user_info");

    if (authSuccess === "true" && userInfo) {
      try {
        const user = JSON.parse(decodeURIComponent(userInfo));
        setIsUserLoggedIn(user); // Set login state to true
        console.log("hi", user);
        console.log("hi", IsUserLoggedIn);
        localStorage.setItem("user", JSON.stringify(user)); // Store user info in localStorage
        navigate("/"); // Navigate to home page
      } catch (error) {
        console.error("Error parsing user info:", error);
        setError("Error processing user information");
      }
    } else if (authSuccess === "false") {
      setError("Authentication failed");
    }
  }, [navigate, setIsUserLoggedIn]);

  return (
    <LoginContainer>
      <LoginForm>
        <Typography variant="h4" gutterBottom>
          Sign In
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{ mt: 2 }}
        >
          Sign in with Google
        </Button>
      </LoginForm>
    </LoginContainer>
  );
}

export default Login;
