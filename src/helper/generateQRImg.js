import QRCode from 'qrcode';
import sharp from 'sharp';
import { join } from 'path';
import { promises as fs } from 'fs';

/**
 * Generates a QR code and overlays it on an existing image.
 * @param {string} text - The text to encode in the QR code.
 * @param {string} overlayImagePath - The path to the overlay image.
 * @returns {Promise<Buffer>} - A promise that resolves to the resulting image buffer.
 */
export async function generateQrOverlay(text, overlayImagePath) {
    try {
        // Generate QR code as a buffer
        const qrBuffer = await QRCode.toBuffer(text, { errorCorrectionLevel: 'H' });

        // Load overlay image and overlay QR code
        const outputImage = await sharp(overlayImagePath)
            .composite([{ input: qrBuffer, gravity: 'southeast' }]) // Adjust gravity to position QR code
            .toBuffer();

        return outputImage;
    } catch (error) {
        console.error('Error generating QR code overlay:', error);
        throw new Error('Failed to generate QR code overlay');
    }
}

/**
 * Generates an array of QR code images based on the provided texts.
 * @param {Array<string>} texts - An array of texts to encode in QR codes.
 * @param {string} overlayImagePath - The path to the overlay image.
 * @returns {Promise<Array<Buffer>>} - A promise that resolves to an array of image buffers.
 */
export async function generateMultipleQrOverlays(texts, overlayImagePath) {
    const imageBuffers = [];

    for (const text of texts) {
        const imageBuffer = await generateQrOverlay(text, overlayImagePath);
        imageBuffers.push(imageBuffer);
    }

    return imageBuffers;
}
