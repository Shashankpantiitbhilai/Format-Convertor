const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { parseWordFile, generateTableWordFile } = require('../utils/WordUtils');

exports.handleFileUpload = async (req, res) => {
    try {
        const filePath = req.file.path;
        const result = await mammoth.extractRawText({ path: filePath });
        const parsedData = parseWordFile(result.value);

        if (parsedData.length === 0) {
            throw new Error('No questions found in the document');
        }

        // Use absolute path for output directory
        
        const outputDir = process.env.NODE_ENV === 'development' ? path.join(__dirname,'..', 'output') : '/tmp/output';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFilePath = path.join(outputDir, `${Date.now()}_output.docx`);
        await generateTableWordFile(parsedData, outputFilePath);
        console.log(outputFilePath)
        const downloadUrl =
            process.env.NODE_ENV === "production"
                ? `https://formatconvertorbackend-shashank-pants-projects.vercel.app/output/${path.basename(outputFilePath)}`
                : `http://localhost:5000/output/${path.basename(outputFilePath)}`;

        res.json({ downloadLink: downloadUrl });
    } catch (err) {
        console.error('Error in handleFileUpload:', err);
        res.status(500).send(`Error processing file: ${err.message}`);
    }
};
