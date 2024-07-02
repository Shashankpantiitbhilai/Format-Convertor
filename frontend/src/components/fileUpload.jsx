import React, { useState } from "react";
import axios from "axios";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Button,
  CircularProgress,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import mammoth from "mammoth";

// Create a custom theme with green-yellow options
const theme = createTheme({
  palette: {
    primary: {
      main: "#388e3c", // Green color for primary elements
    },
    secondary: {
      main: "#fbc02d", // Yellow color for secondary elements
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
    setError(null); // Reset error state before starting the upload
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
       const response = await fetch(
         `${downloadLink}`
       ); // Replace with your actual URL
       const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
    
      setDocContent(result.value); // 
   
    } catch (error) {
      console.error("Error uploading file:", error.response.data);
      // Check if there is a response from the backend
      if (error.response && error.response.data) {
        setError(error.response.data); // Update error state with backend error message
      } else {
        setError("An unexpected error occurred."); // Fallback error message
      }
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <ThemeProvider theme={theme}>
      <StyledUploadContainer
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" component="h1">
          Upload your file
        </Typography>
        <TextField
          type="file"
          onChange={(e) => {
            handleFileChange(e);
           
          }}
          variant="outlined"
          inputProps={{ style: { padding: "10px" } }}
          sx={{ width: "300px", backgroundColor: "white", borderRadius: "4px" }}
        />
        <StyledButton
          variant="contained"
          onClick={handleFileUpload}
          disabled={!file || loading}
          component={motion.button}
          style={{ backgroundColor: "white", color: "black" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {loading ? <CircularProgress size={24} /> : "Upload"}
        </StyledButton>
        {downloadLink && (
          <Box mt={2}>
            <StyledButton
              variant="contained"
              color="secondary"
              href={downloadLink}
              download
              component={motion.a}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              onClick={() => {
                handleDownload();
              }}
              sx={{
                backgroundColor: "orange",
                "&:hover": { backgroundColor: "#e65100" },
              }}
            >
              Download Processed File
            </StyledButton>
          </Box>
        )}
      </StyledUploadContainer>
      {error && (
        <Typography
          variant="body1"
          color="error"
          sx={{ fontWeight: "bold", marginTop: "20px" }}
        >
          {error}
        </Typography>
      )}
      {docContent && (
        <StyledDocContentContainer>
          <div dangerouslySetInnerHTML={{ __html: docContent }} />
        </StyledDocContentContainer>
      )}
    </ThemeProvider>
  );
};

const StyledUploadContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "20px",
  padding: "40px",
  borderRadius: "10px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.secondary.contrastText,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  "&:disabled": {
    backgroundColor: theme.palette.primary.light,
  },
}));

const StyledDocContentContainer = styled(Box)(({ theme }) => ({
  marginTop: "20px",
  padding: "20px",
  borderRadius: "10px",
  backgroundColor: "white",
  maxHeight: "400px",
  overflowY: "auto",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  "& h1, h2, h3, h4, h5, h6": {
    color: theme.palette.primary.main,
  },
}));

export default FileUpload;
