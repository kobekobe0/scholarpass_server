import express from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';

const upload = multer({ storage: multer.memoryStorage() });

// Expect only one image
const uploadSingleImage = upload.single('image');

const processImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const dir = './src/images/'
    const filename = req.params.id ? req.params.id + '_pfp.webp' : new Date().getTime() + '_pfp.webp';
    const outputPath = path.join(dir, filename);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(file.buffer)
      .webp()
      .toFile(outputPath);

    req.filename = filename;
    
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export { uploadSingleImage, processImage };
