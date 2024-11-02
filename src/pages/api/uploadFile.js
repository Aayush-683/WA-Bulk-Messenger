// pages/api/uploadFile.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import axios from 'axios';
import path from 'path';

// Disable the default body parser since we are handling the file upload ourselves
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadFile = async (req, res) => {
  const form = new IncomingForm();

  // Set the upload directory
  const uploadDir = path.join(process.cwd(), 'src/data/uploads'); // Ensure this directory exists
  form.uploadDir = uploadDir; // Set upload directory
  form.keepExtensions = true; // Keep file extensions

  // Parse the incoming form data
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the files:', err);
      return res.status(500).json({ error: 'Error parsing the files' });
    }

    // Ensure the file is present
    if (!files.file || !files.file[0]) {
      console.error('No file uploaded:', files.file);
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get file details
    const file = files.file[0]; // Access the first file if multiple files are uploaded
    const oldPath = file.filepath; // Get the temporary filepath
    const originalFilename = file.originalFilename; // Get the original filename

    // Validate file properties
    if (!oldPath || !originalFilename) {
      console.error('File properties are missing:', file);
      return res.status(400).json({ error: 'Invalid file properties' });
    }

    // Set the new file path, ensuring to preserve the file extension
    const extension = path.extname(originalFilename);
    const newFilename = `${path.basename(originalFilename, extension)}${extension}`; // Retain the extension
    const newPath = path.join(uploadDir, newFilename);

    // Check if the file already exists
    if (fs.existsSync(newPath)) {
        // Delete the existing file
        fs.unlinkSync(newPath);
    }

    // Move the file to the desired location
    fs.rename(oldPath, newPath, async (err) => {
      if (err) {
        console.error('Error moving the file:', err);
        return res.status(500).json({ error: 'Error moving the file' });
      }
    });

    // Return the file details
    res.status(200).json({ success: true, file: { name: newFilename, path: newPath } });
  });
};

export default uploadFile;
