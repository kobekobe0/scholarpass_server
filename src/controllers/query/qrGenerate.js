import QRCode from 'qrcode';
import sharp from 'sharp';
import archiver from 'archiver';
import Card from '../../models/Card.js';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import Student from '../../models/Student.js';
import Vehicle from '../../models/Vehicle.js';
import { encryptObject } from '../../helper/encryption.js';

export const qrGenerateVisitor = async (req, res) => {
    const { CardID, details } = req.body;
    
    try {
        // Fetch the template image (base64) from the database
        const cardObject = await Card.findById(CardID).select('templateImage');
        if (!cardObject) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const templateBase64 = cardObject.templateImage;

        // Validate the base64 string
        if (!templateBase64.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid template image format' });
        }

        // Convert base64 image to a buffer
        const templateBuffer = Buffer.from(templateBase64.split(',')[1], 'base64');

        // Create a PDF document
        const doc = new PDFDocument({
            size: 'LETTER', // 8x11 inches
            margin: 10,
        });

        // Set the response headers for the PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=qr_codes.pdf');

        // Create a PassThrough stream to pipe the PDF to the response
        const passThrough = new PassThrough();
        doc.pipe(passThrough);
        passThrough.pipe(res);

        // Define layout parameters
        const cardWidth = 200; // Width of each card in the grid
        const cardHeight = 300; // Height of each card
        const margin = 5; // Margin between cards
        const cardsPerRow = 3; // Number of cards per row

        // Process each detail to generate QR codes and add to the PDF
        for (const [index, detail] of details.entries()) {
            const detailString = JSON.stringify(detail);

            const encryptedData = encryptObject(detailString);

            // Generate the QR code buffer with a transparent background
            const qrCodeBuffer = await QRCode.toBuffer(encryptedData, {
                errorCorrectionLevel: 'H',
                width: 360, // Set QR code size to 370x370
                margin: 1,
                color: {
                    dark: '#000000',  // Black QR code
                    light: '#00000000' // Transparent background
                }
            });

            // Load the template image buffer
            const templateImage = await sharp(templateBuffer)
                .resize(500, 707) // Resize the template to match the desired output dimensions
                .toBuffer();

            // Create an image with text (Visitor Pass and card number)
            const textBuffer = await sharp({
                create: {
                    width: 500,
                    height: 150, // Increased height for both texts
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
                }
            })
                .composite([{
                    input: Buffer.from(
                        `<svg width="500" height="150">
                            <text x="50%" y="50%" font-weight="semibold" font-size="30" text-anchor="middle" fill="rgb(15, 15, 15, 90)" dominant-baseline="middle" font-family="Verdana">
                                Visitor Pass
                            </text>
                            <text x="50%" y="100" font-size="20" text-anchor="middle" fill="rgb(15, 15, 15, 90)" dominant-baseline="middle" font-family="Verdana">
                                ${detail.cardNumber}
                            </text>
                        </svg>`
                    ),
                    top: 0,
                    left: 0
                }])
                .png()
                .toBuffer();

            // Combine the QR code and text into one image
            const qrWithOverlay = await sharp(templateImage)
                .composite([
                    {
                        input: qrCodeBuffer,
                        top: Math.round((707 - 370) / 2), // Center QR code vertically
                        left: Math.round((500 - 370) / 2) // Center QR code horizontally
                    },
                    {
                        input: textBuffer,
                        top: Math.round((707 - 370) / 2) + 370 + 50, // Position text 50px below the QR code
                        left: 0 // Center horizontally
                    }
                ])
                .png()
                .toBuffer();

            // Add the image to the PDF in a grid layout
            const x = (index % cardsPerRow) * (cardWidth + margin);
            const y = Math.floor(index / cardsPerRow) * (cardHeight + margin);

            // Add a new page if the current position exceeds the page size
            if (y + cardHeight > doc.page.height) {
                doc.addPage();
            }

            // Draw the image onto the PDF
            doc.image(qrWithOverlay, x, y, {
                width: cardWidth,
                height: cardHeight,
                align: 'center',
                valign: 'center'
            });
        }

        // Finalize the PDF and end the stream
        doc.end();

    } catch (error) {
        console.error('Error generating QR code overlay:', error);
        res.status(500).json({ message: 'Failed to generate QR code overlay', error: error.message });
    }
};



export const qrGenerateStudent = async (req, res) => {
    const { studentID, vehicleID, cardID } = req.body;
    console.log("BODY: ",req.body)
    try {
        // Fetch the template image (base64) from the database
        const cardObject = await Card.findById(cardID).select('templateImage');
        if (!cardObject) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const templateBase64 = cardObject.templateImage;

        // Validate the base64 string
        if (!templateBase64.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid template image format' });
        }

        // Convert base64 image to a buffer
        const templateBuffer = Buffer.from(templateBase64.split(',')[1], 'base64');

        // Fetch student details
        const student = await Student.findById(studentID).select('name studentNumber');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Fetch vehicle details if vehicleID is provided
        let vehicleModel = '';
        if (vehicleID) {
            const vehicle = await Vehicle.findById(vehicleID).select('model');
            if (vehicle) {
                vehicleModel = vehicle.model;
            }
        }

        let qrData = {}

        if(vehicleID) qrData.vehicleID = vehicleID
        qrData.studentID = studentID

        const stringData = JSON.stringify(qrData);

        const encryptedData = encryptObject(stringData);

        // Create the QR code buffer with student number
        const qrCodeBuffer = await QRCode.toBuffer(encryptedData, {
            errorCorrectionLevel: 'H',
            width: 350,
            margin: 1,
            color: {
                dark: '#000000',  // Black QR code
                light: '#00000000' // Transparent background
            }
        });

        // Load the template image buffer
        const templateImage = await sharp(templateBuffer)
            .resize(500, 707) // Resize the template to match the desired output dimensions
            .toBuffer();

        // Create an image with student information
        const textBuffer = await sharp({
            create: {
                width: 500,
                height: 150, // Height for both texts
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
            }
        })
            .composite([{
                input: Buffer.from(
                    `<svg width="500" height="150">
                        <text x="50%" y="40%" font-weight="bold" font-size="30" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="middle" font-family="Open Sans">
                            ${student.name}
                        </text>
                        <text x="50%" y="85" font-size="15" text-anchor="middle" fill="rgb(15, 15, 15, 90)" dominant-baseline="middle" font-family="Verdana">
                            ${student.studentNumber}
                        </text>
                        <text x="50%" y="110" font-size="20" text-anchor="middle" fill="rgb(15, 15, 15, 80)" dominant-baseline="middle" font-family="Verdana">
                            ${vehicleModel ? vehicleModel : ""}
                        </text>
                    </svg>`
                ),
                top: 0,
                left: 0
            }])
            .png()
            .toBuffer();

        // Combine the QR code and text into one image
        const qrWithOverlay = await sharp(templateImage)
            .composite([
                {
                    input: qrCodeBuffer,
                    top: Math.round((707 - 350) / 2), // Center QR code vertically
                    left: Math.round((500 - 350) / 2) // Center QR code horizontally
                },
                {
                    input: textBuffer,
                    top: Math.round((707 - 370) / 2) + 370 + 20, // Position text below the QR code
                    left: 0 // Center horizontally
                }
            ])
            .png()
            .toBuffer();
        
        console.log(vehicleModel)
        console.log(student)

        res.setHeader('Content-Type', 'image/png');
        res.send(qrWithOverlay);
        

    } catch (error) {
        console.error('Error generating QR code overlay:', error);
        res.status(500).json({ message: 'Failed to generate QR code overlay', error: error.message });
    }
};