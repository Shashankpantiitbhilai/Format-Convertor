const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleFileUpload } = require('../controllers/fileController');


const upload=require("../multer")

router.post('/upload', upload.single('file'), handleFileUpload);

module.exports = router;
