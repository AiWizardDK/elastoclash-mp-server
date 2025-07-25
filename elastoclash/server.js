const express = require('express');
const path = require('path');
const app = express();

// Konfigurer static fil servering
app.use(express.static(path.join(__dirname, './'), {
    setHeaders: (res, filePath) => {
        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.mp3': 'audio/mpeg',
        };
        
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
    }
}));

// Håndter 404 fejl
app.use((req, res) => {
    res.status(404).send('File not found');
});

// Håndter server fejl
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server error');
});

const port = 5500;
app.listen(port, () => {
    console.log(`Server kører på http://localhost:${port}/`);
});