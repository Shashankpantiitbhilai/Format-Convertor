const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { parseWordFile, generateTableWordFile } = require('../utils/WordUtils');

exports.handleFileUpload = async (req, res) => {
    try {
        const filePath = req.file.path;
        const result = await mammoth.extractRawText({ path: filePath });
        // console.log('Extracted text:', result.value);
        const parsedData = parseWordFile(result.value);
        // console.log('Parsed data:', parsedData);

        if (parsedData.length === 0) {
            throw new Error('No questions found in the document');
        }
        console.log(parsedData)
        const outputDir = 'output';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFilePath = `${outputDir}/${Date.now()}_output.docx`;
        await generateTableWordFile(parsedData, outputFilePath);
        // fs.unlink(out)
        
        const url =
            process.env.NODE_ENV === "production"
                ? `https://formatconvertorbackend-shashank-pants-projects.vercel.app/${outputFilePath}`
                : `http://localhost:5000/${outputFilePath}`;

        res.json({ downloadLink: url});
    } catch (err) {
        console.error('Error in handleFileUpload:', err);
        res.status(500).send(`Error processing file: ${err.message}`);
    }
};