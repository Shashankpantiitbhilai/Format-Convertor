const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleFileUpload } = require('../controllers/fileController');

const dest = process.env.NODE_ENV == 'development' ? path.join(__dirname, 'uploads') : '/tmp/uploads';
const upload = multer({ dest});

router.post('/upload', upload.single('file'), handleFileUpload);

module.exports = router;
