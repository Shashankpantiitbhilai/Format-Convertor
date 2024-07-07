import React, { useContext, useState, useEffect } from "react";
import { AdminContext } from "../../App";
import {
  Button,
  Container,
  Box,
  Typography,
  Alert,
  Paper,
  CssBaseline,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { styled, keyframes } from "@mui/system";
import { useNavigate } from "react-router-dom";
import logo from "../../images/logo.jpg"; // Adjust the path based on your project structure
import { createTheme, ThemeProvider } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
    background: {
      default: "#303030",
      paper: "#424242",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const LoginContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  backgroundColor: theme.palette.background.default,
  animation: `${fadeIn} 1s ease-in-out`,
}));

const LoginForm = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: "500px",
  padding: "40px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  borderRadius: "8px",
  textAlign: "center",
  backgroundColor: theme.palette.background.paper,
  animation: `${slideIn} 1s ease-in-out`,
}));

const Logo = styled("img")({
  width: "120px",
  height: "120px",
  marginBottom: "20px",
});

const Introduction = styled(Box)(({ theme }) => ({
  marginBottom: "30px",
  textAlign: "left",
  color: theme.palette.text.primary,
}));

const ErrorAlert = styled(Alert)({
  marginBottom: "20px",
});

function Login() {
  const { IsUserLoggedIn, setIsUserLoggedIn } = useContext(AdminContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const backendUrl =
    process.env.NODE_ENV === "production"
      ? "https://formatconvertorbackend-shashank-pants-projects.vercel.app"
      : "http://localhost:5000";

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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <LoginContainer>
        <LoginForm>
          <Logo src={logo} alt="Edugainer Logo" />
          <Introduction>
            <Typography variant="h4" gutterBottom>
              EduGainer DocConvert
            </Typography>
            <Typography variant="body1" gutterBottom>
              Edugainer provides top-notch library and class facilities to help
              you excel in your studies and competitive exam preparations. Sign
              in to access a world of knowledge and learning opportunities.
            </Typography>
          </Introduction>
          {error && <ErrorAlert severity="error">{error}</ErrorAlert>}
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
    </ThemeProvider>
  );
}

export default Login;
