const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileRoutes = require('./routes/fileRoutes');
const path = require('path');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/output', express.static(path.join(__dirname, 'output')));

app.use('/api/files', fileRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
