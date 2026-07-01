const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();
const buildPath = path.join(__dirname, '/build/');
const indexPath = path.join(buildPath, 'index.html');

app.use(express.static(buildPath));
app.use(redirectUnmatched);
app.get('/*', redirectUnmatched);

// Try HTTPS first, fallback to HTTP
try {
  const options = {
    key: fs.readFileSync('./.cert/key.pem'),
    cert: fs.readFileSync('./.cert/cert.pem'),
  };
  https.createServer(options, app).listen(8000, () => {
    console.log('Server running on https://localhost:8000');
  });
} catch (err) {
  console.log('SSL certificates not found, running HTTP server');
  app.listen(8000, () => {
    console.log('Server running on http://localhost:8000');
  });
}

function redirectUnmatched(req, res) {
  res.sendFile(indexPath);
}
