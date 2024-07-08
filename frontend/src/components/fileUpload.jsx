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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { motion } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";
import RefreshIcon from "@mui/icons-material/Refresh";
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
  backgroundColor: theme.palette.background.default,
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
  boxShadow: `0 8px 16px ${theme.palette.primary.dark}`,
  transition: "box-shadow 0.3s ease-in-out",
  "&:hover": {
    boxShadow: `0 12px 20px ${theme.palette.primary.dark}`,
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
  const [openDialog, setOpenDialog] = useState(false);
  const [styledHtml, setStyledHtml] = useState("");

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
      setStyledHtml(styledHtml);
      setOpenDialog(true);
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

  const handleClear = () => {
    setFile(null);
    setDownloadLink("");
    setError(null);
    setDocContent("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
                <Alert
                  severity="warning"
                  sx={{
                    backgroundColor: "#FFD700",
                    color: "#333",
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Typography variant="h6" sx={{ marginBottom: "10px" }}>
                    Upload Limit Exceeded
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                    You have exhausted your upload limit.
                  </Typography>
                  <Typography variant="body2">
                    Please contact support for further assistance at{" "}
                    <strong>Call: 9997999765</strong>.
                  </Typography>
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
                  {file && (
                    <Button
                      variant="contained"
                      startIcon={<RefreshIcon />}
                      onClick={handleClear}
                      size="large"
                      sx={{
                        backgroundColor: "#f06292",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "#ec407a",
                        },
                        mt: 2,
                        ml: 2,
                      }}
                    >
                      Refresh
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={
                      loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        <CloudUploadIcon />
                      )
                    }
                    onClick={handleFileUpload}
                    disabled={!file || loading}
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
                    {loading ? "Uploading..." : "Upload"}
                  </Button>
                  {progress > 0 && (
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", mt: 2 }}
                    >
                      Upload Progress: {progress}%
                    </Typography>
                  )}

                  {error && (
                    <Typography
                      variant="body1"
                      color="error"
                      sx={{ fontWeight: "bold", mt: 2 }}
                    >
                      Error: {error}
                    </Typography>
                  )}
                </StyledPaper>
              </Grid>
            </Grid>
          </Container>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>File Preview</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Below is a preview of the converted file:
            </DialogContentText>
            <div
              dangerouslySetInnerHTML={{ __html: styledHtml }}
              style={{ maxHeight: "400px", overflowY: "auto" }}
            ></div>
          </DialogContent>
          <DialogActions>
            {downloadLink && (
              <Button
                variant="contained"
                startIcon={<GetAppIcon />}
                onClick={handleDownload}
                size="large"
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  color: "white",
                  "&:hover": {
                    backgroundColor: theme.palette.secondary.dark,
                  },
                  mt: 2,
                }}
              >
                Download File
              </Button>
            )}
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </RootContainer>
    </ThemeProvider>
  );
};

export default FileUpload;
