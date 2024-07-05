import React, { useState } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";
import mammoth from "mammoth";

// Custom theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: "#388e3c", // Green color for primary elements
      dark: "#2c6b2f", // Dark green for primary elements
    },
    secondary: {
      main: "#fbc02d", // Yellow color for secondary elements
      dark: "#c49000", // Dark yellow for secondary elements
    },
    background: {
      default: "#f0f0f0", // Light gray background color
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

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadLink, setDownloadLink] = useState("");
  const [error, setError] = useState(null); // Error state for handling errors
  const [docContent, setDocContent] = useState(""); // State to hold converted DOCX content

  // Function to handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setDownloadLink("");
    setError(null); // Reset error state on new file selection
    setDocContent(""); // Reset DOCX content state
  };

  // Function to handle download link cleanup
  const handleDownload = async () => {
    setDownloadLink(""); // Clear download link state

    // Function to delete files after 10 seconds delay
    const deleteFilesWithDelay = async () => {
      const url =
        process.env.NODE_ENV === "production"
          ? "https://formatconvertorbackend-shashank-pants-projects.vercel.app/api/files/delete"
          : "http://localhost:5000/api/files/delete";

      try {
        const res = await axios.delete(url);
        console.log("File deletion response:", res.data);
        // Handle deletion response as needed
      } catch (error) {
        console.error("Error deleting files:", error.message);
        // Handle deletion error as needed
      }
    };
    setFile("");
    setProgress(0);
    setDownloadLink("");
    setError(null); // Reset error state on new file selection
    setDocContent("");
    setTimeout(deleteFilesWithDelay, 10000); // Set timeout for file deletion
  };

  // Function to handle file upload and conversion
  const handleFileUpload = async () => {
    setLoading(true); // Set loading state
    setProgress(0); // Reset progress

    const formData = new FormData();
    formData.append("file", file);

    const url =
      process.env.NODE_ENV === "production"
        ? "https://formatconvertorbackend-shashank-pants-projects.vercel.app/api/files/upload"
        : "http://localhost:5000/api/files/upload";

    try {
      // Upload file and get download link
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
      setDownloadLink(res.data.downloadLink); // Set download link

      // Fetch and convert DOCX content to HTML
      const response = await fetch(`${res.data.downloadLink}`);
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });

      // Add CSS for table styling
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

      setDocContent(styledHtml); // Set converted DOCX content
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data); // Set error message from server response
      } else {
        setError("An unexpected error occurred."); // Set generic error message
      }
    } finally {
      setLoading(false); // Reset loading state
      setProgress(0); // Reset progress after completion
    }
  };

  return (
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
                  <CircularProgress
                    size={24}
                    variant={progress > 0 ? "determinate" : "indeterminate"}
                    value={progress}
                  />
                ) : (
                  "Upload"
                )}
              </Button>
              {progress > 0 && (
                <Typography variant="body2" color="textSecondary">
                  {`${progress}% uploaded`}
                </Typography>
              )}
              {error && (
                <Alert
                  severity="error"
                  sx={{ width: "100%", marginTop: "20px" }}
                >
                  {error}
                </Alert>
              )}
            </Paper>
          </Grid>
          {downloadLink && (
            <>
              <Button
                variant="contained"
                startIcon={<GetAppIcon />}
                onClick={handleDownload}
                href={downloadLink}
                sx={{
                  marginTop: "10px",
                  backgroundColor: theme.palette.secondary.dark,
                  color: "white",
                  size: "small",
                  "&:hover": {
                    backgroundColor: theme.palette.secondary.main,
                  },
                }}
              >
                Download Converted File
              </Button>
            </>
          )}
          {downloadLink && (
            <Grid item xs={12}>
              <Paper
                sx={{
                  marginTop: "20px",
                  padding: "20px",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                  width: "100%",
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Converted HTML Content
                </Typography>
                <div dangerouslySetInnerHTML={{ __html: docContent }} />
              </Paper>
            </Grid>
          )}
        </Grid>
        <Typography
          variant="body2"
          align="center"
          color="textSecondary"
          sx={{ marginTop: "20px" }}
        >
          Version 3.0
        </Typography>
      </Container>
    </ThemeProvider>
  );
};

export default FileUpload;