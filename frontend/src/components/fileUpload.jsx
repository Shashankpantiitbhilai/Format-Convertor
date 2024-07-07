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
    primary: {
      main: "#388e3c",
      dark: "#2c6b2f",
    },
    secondary: {
      main: "#fbc02d",
      dark: "#c49000",
    },
    background: {
      default: "#f0f0f0",
    },
  },
  typography: {
    h4: {
      fontWeight: "bold",
      color: "orange",
    },
    h5: {
      fontWeight: "bold",
      color: "#388e3c",
    },
  },
});

const RootContainer = styled(Container)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: "50px",
});

const StyledHeading = styled(Typography)({
  textAlign: "center",
  fontWeight: "bold",
  color: "#EE4E4E",
});

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
    <>
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
        </RootContainer>
      </ThemeProvider>
      {remainingUploads === 0 && (
        <ThemeProvider theme={theme}>
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
        </ThemeProvider>
      )}
      {remainingUploads > 0 && (
        <ThemeProvider theme={theme}>
          <Container maxWidth="lg" sx={{ marginTop: "50px" }}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Paper
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  elevation={3}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "20px",
                    padding: "20px",
                    borderRadius: "10px",
                    backgroundColor: theme.palette.background.default,
                  }}
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
                      }}
                    >
                      Select File
                    </Button>
                  </label>
                  {file && (
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
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
                </Paper>
              </Grid>
            </Grid>
            <Grid container spacing={3} justifyContent="center">
              <Grid item>
                {downloadLink && (
                  <Button
                    variant="contained"
                    href={downloadLink}
                    onClick={handleDownload}
                    startIcon={<GetAppIcon />}
                    download
                    size="large"
                    sx={{
                      backgroundColor: theme.palette.secondary.dark,
                      color: "white",
                      "&:hover": {
                        backgroundColor: theme.palette.secondary.main,
                      },
                    }}
                  >
                    Download Converted File
                  </Button>
                )}
              </Grid>
            </Grid>
            {docContent && (
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} md={8}>
                  <Paper
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    elevation={3}
                    sx={{
                      padding: "20px",
                      marginTop: "20px",
                      borderRadius: "10px",
                      backgroundColor: theme.palette.background.paper,
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: docContent }} />
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Container>
        </ThemeProvider>
      )}
    </>
  );
};

export default FileUpload;
