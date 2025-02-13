const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;

app.post('/run-wifireset', (req, res) => {
    exec('node path/to/wifireset.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error}`);
            return res.status(500).send('Error executing script');
        }
        console.log(`Script output: ${stdout}`);
        res.send('WiFi reset script executed successfully');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
