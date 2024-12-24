const { exec } = require('child_process');
const path = require('path');

const mlModel = (req, res) => {
    const { imagePath } = req.body;  

    if (!imagePath) {
        return res.status(400).send('No image path provided');
    }

    // Update __dirname to resolve the correct path to 'virtualTryOn.py'
    const pythonScriptPath = path.join(__dirname, '..', 'models', 'virtualTryOn.py'); 

    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

    exec(`${pythonCommand} ${pythonScriptPath} --image_path ${imagePath}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).send('Error processing the image');
        }

        res.send({ overlayedImage: stdout.trim() });
    });
};
