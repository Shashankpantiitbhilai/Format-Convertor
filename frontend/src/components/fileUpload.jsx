import React, { useState } from "react";
import axios from "axios";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
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

// Create a custom theme with green-yellow options
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
    error: {
      main: "#f44336", // Red color for error states
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
  const [downloadLink, setDownloadLink] = useState("");
  const [error, setError] = useState(null); // New error state
  const [docContent, setDocContent] = useState(""); // New state to hold DOCX content

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setDownloadLink("");
    setError(null); // Reset error state when a new file is selected
    setDocContent(""); // Reset DOCX content state
  };

  const handleDownload = async () => {
    setDownloadLink("");
    const deleteFilesWithDelay = async () => {
      const url =
        process.env.NODE_ENV === "production"
          ? "https://formatconvertorbackend-shashank-pants-projects.vercel.app/api/files/delete"
          : "http://localhost:5000/api/files/delete";

      try {
        const res = await axios.delete(url);
        console.log("File deletion response:", res.data);
        // Handle response as needed
      } catch (error) {
        console.error("Error deleting files:", error.message);
        // Handle error as needed
      }
    };

    // Set a timeout to execute deleteFilesWithDelay after 10 seconds (10000 milliseconds)
    setTimeout(deleteFilesWithDelay, 10000);
  };

  const handleFileUpload = async () => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const url =
      process.env.NODE_ENV === "production"
        ? "https://formatconvertorbackend-shashank-pants-projects.vercel.app/api/files/upload"
        : "http://localhost:5000/api/files/upload";
    try {
      const res = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setDownloadLink(res.data.downloadLink);
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

      setDocContent(styledHtml);
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
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
                onChange={(e) => {
                  handleFileChange(e);
                }}
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
                {loading ? <CircularProgress size={24} /> : "Upload"}
              </Button>
            </Paper>
          </Grid>
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
      </Container>
    </ThemeProvider>
  );
};

export default FileUpload;
