import React, { useState, useEffect } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";
import mammoth from "mammoth";
import { styled } from "@mui/system";
import { fetchCredentials, UpdateUserCount } from "../services/auth";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
      dark: "#42a5f5",
    },
    secondary: {
      main: "#f48fb1",
      dark: "#f06292",
    },
    background: {
      default: "#303030",
      paper: "#424242",
    },
  },
  typography: {
    h4: {
      fontWeight: "bold",
      color: "orange",
    },
    h5: {
      fontWeight: "bold",
      color: "#90caf9",
    },
  },
});

const RootContainer = styled(Container)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: "50px",
  backgroundColor: theme.palette.background.default, // Apply dark background to root container
});

const StyledHeading = styled(Typography)({
  textAlign: "center",
  fontWeight: "bold",
  color: "#EE4E4E",
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: "20px",
  borderRadius: "10px",
  backgroundColor: theme.palette.background.paper,
  textAlign: "center",
  boxShadow: `0 8px 16px ${theme.palette.primary.dark}`, // Flashy box shadow
  transition: "box-shadow 0.3s ease-in-out",
  "&:hover": {
    boxShadow: `0 12px 20px ${theme.palette.primary.dark}`, // Adjusted shadow on hover
  },
}));

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadLink, setDownloadLink] = useState("");
  const [error, setError] = useState(null);
  const [docContent, setDocContent] = useState("");
  const [remainingUploads, setRemainingUploads] = useState(3);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await fetchCredentials();
        const { uploadCount } = res;
        setRemainingUploads(uploadCount);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setDownloadLink("");
    setError(null);
    setDocContent("");
  };

  const handleDownload = async () => {
    setDownloadLink("");

    const deleteFilesWithDelay = async () => {
      const url =
        process.env.NODE_ENV === "production"
          ? "https://formatconvertorbackend-shashank-pants-projects.vercel.app/api/files/delete"
          : "http://localhost:5000/api/files/delete";

      try {
        await axios.delete(url);
        console.log("Files deleted successfully");
      } catch (error) {
        console.error("Error deleting files:", error.message);
      }
    };

    setTimeout(deleteFilesWithDelay, 10000);
  };

  const handleFileUpload = async () => {
    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const url =
      process.env.NODE_ENV === "production"
        ? "https://formatconvertorbackend-shashank-pants-projects.vercel.app/api/files/upload"
        : "http://localhost:5000/api/files/upload";

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentCompleted = Math.round((loaded * 100) / total);
          setProgress(percentCompleted);
        },
      };

      const res = await axios.post(url, formData, config);
      setDownloadLink(res.data.downloadLink);

      const response = await fetch(res.data.downloadLink);
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });

      const styledHtml = `
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1em;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
        </style>
        ${result.value}
      `;

      const updatecount = await UpdateUserCount();
      setRemainingUploads(updatecount.uploadCount);
      setDocContent(styledHtml);
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <RootContainer>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StyledHeading variant="h3" component="h1">
            EduGainer File Converter
          </StyledHeading>
          <Typography variant="body2" align="center" color="textSecondary">
            Version 3.0
          </Typography>
        </motion.div>

        {remainingUploads === 0 && (
          <Container maxWidth="lg" sx={{ marginTop: "50px" }}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Alert severity="warning">
                  You have exhausted your upload limit. Please contact support
                  for further assistance.
                </Alert>
              </Grid>
            </Grid>
          </Container>
        )}

        {remainingUploads > 0 && (
          <Container maxWidth="lg" sx={{ marginTop: "50px" }}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                <StyledPaper
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  elevation={3}
                >
                  <Typography variant="h4" component="h1">
                    Upload Your File
                  </Typography>
                  <Typography variant="body1">
                    {`Remaining Uploads: ${remainingUploads}`}
                  </Typography>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="file-upload-input"
                  />
                  <label htmlFor="file-upload-input">
                    <Button
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      component="span"
                      size="large"
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: "white",
                        "&:hover": {
                          backgroundColor: theme.palette.primary.dark,
                        },
                        mt: 2,
                      }}
                    >
                      Select File
                    </Button>
                  </label>
                  {file && (
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", mt: 2 }}
                    >
                      Selected File: {file.name}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<GetAppIcon />}
                    onClick={handleFileUpload}
                    disabled={!file || loading}
                    sx={{
                      backgroundColor: theme.palette.secondary.dark,
                      color: "white",
                      "&:hover": {
                        backgroundColor: theme.palette.secondary.main,
                      },
                      mt: 2,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : (
                      "Upload and Convert"
                    )}
                  </Button>
                  {error && (
                    <Alert
                      severity="error"
                      sx={{ width: "100%", marginTop: "10px" }}
                    >
                      {error}
                    </Alert>
                  )}
                  {progress > 0 && progress < 100 && (
                    <CircularProgress
                      variant="determinate"
                      value={progress}
                      sx={{ marginTop: "10px" }}
                    />
                  )}
                </StyledPaper>
              </Grid>
            </Grid>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                {downloadLink && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <StyledPaper elevation={3} sx={{ marginTop: "30px" }}>
                      <Typography variant="h5" component="h2">
                        Download Converted File
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<GetAppIcon />}
                        href={downloadLink}
                        download
                        size="large"
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: "white",
                          "&:hover": {
                            backgroundColor: theme.palette.primary.dark,
                          },
                          mt: 2,
                        }}
                      >
                        Download
                      </Button>
                    </StyledPaper>
                  </motion.div>
                )}
              </Grid>
            </Grid>
          </Container>
        )}
      </RootContainer>
    </ThemeProvider>
  );
};

export default FileUpload;
