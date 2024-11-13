import QRCode from 'qrcode';
import sharp from 'sharp';
import archiver from 'archiver';
import Card from '../../models/Card.js';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import Student from '../../models/Student.js';
import Vehicle from '../../models/Vehicle.js';
import { encryptObject } from '../../helper/encryption.js';
import TextToSVG from 'text-to-svg';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const createTextImage = (text, fontSize = 30) => {
    const canvas = createCanvas(500, 150);
    const ctx = canvas.getContext('2d');

    // Set font and styles
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = 'rgb(15, 15, 15, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    return canvas.toBuffer();
};

export const qrGenerateVisitor = async (req, res) => {
    const { CardID, details } = req.body;

    try {
        // Fetch the template image (base64) from the database
        const cardObject = await Card.findById(CardID).select('templateImage');
        if (!cardObject) return res.status(404).json({ message: 'Card not found' });
        const templateBase64 = cardObject.templateImage;
        if (!templateBase64.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid template image format' });
        }
        const templateBuffer = Buffer.from(templateBase64.split(',')[1], 'base64');

        const doc = new PDFDocument({ size: 'LETTER', margin: 10 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=qr_codes.pdf');
        const passThrough = new PassThrough();
        doc.pipe(passThrough);
        passThrough.pipe(res);

        const cardWidth = 200;
        const cardHeight = 300;
        const margin = 5;
        const cardsPerRow = 3;

        for (const [index, detail] of details.entries()) {
            const detailString = JSON.stringify(detail);
            const encryptedData = encryptObject(detailString);
            const qrCodeBuffer = await QRCode.toBuffer(encryptedData, {
                errorCorrectionLevel: 'H',
                width: 360,
                margin: 1,
                color: { dark: '#000000', light: '#00000000' }
            });

            const templateImage = await sharp(templateBuffer)
                .resize(500, 707)
                .toBuffer();

            // Generate Visitor Pass and Card Number as images
            const visitorPassTextBuffer = createTextImage('Visitor Pass', 40);
            const cardNumberTextBuffer = createTextImage(detail.cardNumber, 20);

            const qrWithOverlay = await sharp(templateImage)
                .composite([
                    { input: qrCodeBuffer, top: 169, left: 65 },
                    { input: visitorPassTextBuffer, top: 539, left: 0 },
                    { input: cardNumberTextBuffer, top: 589, left: 0 }
                ])
                .png()
                .toBuffer();

            const x = (index % cardsPerRow) * (cardWidth + margin);
            const y = Math.floor(index / cardsPerRow) * (cardHeight + margin);
            if (y + cardHeight > doc.page.height) doc.addPage();

            doc.image(qrWithOverlay, x, y, { width: cardWidth, height: cardHeight, align: 'center', valign: 'center' });
        }

        doc.end();

    } catch (error) {
        console.error('Error generating QR code overlay:', error);
        res.status(500).json({ message: 'Failed to generate QR code overlay', error: error.message });
    }
};



export const qrGenerateStudent = async (req, res) => {
    const { studentID, vehicleID, cardID } = req.body;

    try {
        // Fetch the template image (base64) from the database
        const cardObject = await Card.findById(cardID).select('templateImage');
        if (!cardObject) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const templateBase64 = cardObject.templateImage;

        // Validate and convert base64 image to a buffer
        if (!templateBase64.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid template image format' });
        }
        const templateBuffer = Buffer.from(templateBase64.split(',')[1], 'base64');

        // Fetch student details
        const student = await Student.findById(studentID).select('name studentNumber');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Fetch vehicle details if vehicleID is provided
        let vehicleModel = '';
        if (vehicleID) {
            const vehicle = await Vehicle.findOne({ _id: vehicleID, deleted: false }).select('model');
            if (vehicle) {
                vehicleModel = vehicle.model;
            }
        }

        // Prepare data for QR code
        const qrData = { studentID, vehicleID };
        const stringData = JSON.stringify(qrData);
        const encryptedData = encryptObject(stringData);

        // Generate the QR code buffer
        const qrCodeBuffer = await QRCode.toBuffer(encryptedData, {
            errorCorrectionLevel: 'H',
            width: 350,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#00000000'
            }
        });

        // Load and resize the template image
        const templateImage = await sharp(templateBuffer)
            .resize(500, 707)
            .toBuffer();

        // Use Canvas to create the text image
        const textCanvas = createCanvas(500, 150);
        const ctx = textCanvas.getContext('2d');
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.textAlign = 'center';

        // Render student name
        ctx.font = 'bold 30px Arial';
        ctx.fillText(student.name, 250, 50);

        // Render student number
        ctx.font = '15px Arial';
        ctx.fillText(student.studentNumber, 250, 85);

        // Render vehicle model if available
        if (vehicleModel) {
            ctx.font = '20px Arial';
            ctx.fillText(vehicleModel, 250, 110);
        }

        const textBuffer = textCanvas.toBuffer();

        // Combine the QR code, template, and text into one image
        const qrWithOverlay = await sharp(templateImage)
            .composite([
                {
                    input: qrCodeBuffer,
                    top: Math.round((707 - 350) / 2),
                    left: Math.round((500 - 350) / 2)
                },
                {
                    input: textBuffer,
                    top: Math.round((707 - 350) / 2) + 370 + 20,
                    left: 0
                }
            ])
            .png()
            .toBuffer();

        // Send the final image as a response
        res.setHeader('Content-Type', 'image/png');
        res.send(qrWithOverlay);

    } catch (error) {
        console.error('Error generating QR code overlay:', error);
        res.status(500).json({ message: 'Failed to generate QR code overlay', error: error.message });
    }
};