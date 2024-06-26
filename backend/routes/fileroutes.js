const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleFileUpload,handleFileDelete } = require('../controllers/fileController');


const upload=require("../multer")

router.post('/upload', upload.single('file'), handleFileUpload);
router.delete('/delete', handleFileDelete);
module.exports = router;
