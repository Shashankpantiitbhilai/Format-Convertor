import React, { useState } from "react";
import axios from "axios";
import { styled } from '@mui/system'
import {
  Button,
  CircularProgress,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

const UploadContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "20px",
  padding: "40px",
  borderRadius: "10px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#f5f5f5",
});

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setDownloadLink(res.data.downloadLink);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UploadContainer
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
        onChange={handleFileChange}
        variant="outlined"
        inputProps={{ style: { padding: "10px" } }}
        sx={{ width: "300px" }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleFileUpload}
        disabled={!file || loading}
        component={motion.button}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {loading ? <CircularProgress size={24} /> : "Upload"}
      </Button>
      {downloadLink && (
        <Box mt={2}>
          <Button
            variant="contained"
            color="secondary"
            href={downloadLink}
            download
            component={motion.a}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Download Processed File
          </Button>
        </Box>
      )}
    </UploadContainer>
  );
};

export default FileUpload;
