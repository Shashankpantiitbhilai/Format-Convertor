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


exports.handleFileDelete = async (req, res) => {
    try {
        // Determine the output directory based on the environment
        const outputDir = process.env.NODE_ENV === 'development' ? path.join(__dirname, '..', 'output') : '/tmp/output';
console.log("reached handle delete")
        // Check if the output directory exists
        if (fs.existsSync(outputDir)) {
            // Read all files in the directory
            const files = fs.readdirSync(outputDir);

            // Iterate through each file and delete it
            files.forEach(file => {
                const filePath = path.join(outputDir, file);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        } else {
            throw new Error('Output directory does not exist');
        }

        // Send a success response
        res.json({ message: 'All files deleted successfully' });
    } catch (err) {
        console.error('Error in handleFileDelete:', err);
        res.status(500).send(`Error deleting files: ${err.message}`);
    }
};
