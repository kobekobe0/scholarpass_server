import express from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';

const upload = multer({ storage: multer.memoryStorage() });

// Expect an array of images with the first being displayImage and the second being templateImage
const uploadImages = upload.array('images', 2); // Maximum 2 images

const processImage = async (req, res, next) => {
  try {
    // Log the received files for debugging
    console.log('Received files:', req.files);

    // Check if the files array is present and has the correct length
    if (!req.files || req.files.length !== 2) {
      return res.status(400).json({ error: 'Expecting 2 files: displayImage and templateImage' });
    }

    // Assuming the first file is displayImage and the second is templateImage
    const displayImage = req.files[0]; // First index
    const templateImage = req.files[1]; // Second index

    if (!displayImage || !templateImage) {
      return res.status(400).json({ error: 'Both images must be provided' });
    }

    // Process and convert display image to Base64
    const compressedDisplayBuffer = await sharp(displayImage.buffer)
      .resize({ width: 800 }) // Adjust size as needed
      .webp({ quality: 50 }) // Compress and convert to WebP
      .toBuffer();
    const base64DisplayImage = `data:image/webp;base64,${compressedDisplayBuffer.toString('base64')}`;

    // Process and convert template image to Base64
    const compressedTemplateBuffer = await sharp(templateImage.buffer)
      .resize({width:800})
      .png({qulity: 80})
      .toBuffer();
    const base64TemplateImage = `data:image/png;base64,${compressedTemplateBuffer.toString('base64')}`;

    // Attach the Base64 strings to the request object
    req.filenames = {
      displayImage: base64DisplayImage,
      templateImage: base64TemplateImage,
    };

    // Proceed to the next middleware or route handler
    next();

  } catch (err) {
    console.error('Error processing images:', err); // Log the error for debugging
    return res.status(500).json({ error: err.message });
  }
};

export { uploadImages, processImage };
