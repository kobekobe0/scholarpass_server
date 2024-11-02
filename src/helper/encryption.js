import crypto from 'crypto';

const SECRET_KEY = Buffer.from('12345678901234567890123456789012');

const generateIv = () => {
    return crypto.randomBytes(16);
};

export const encryptObject = (obj) => {
    const iv = generateIv(); // Generate a new IV for each encryption
    const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, iv);
    const jsonString = JSON.stringify(obj);
    
    let encrypted = cipher.update(jsonString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
};

export const decryptObject = (encryptedData) => {
    const parts = encryptedData.split(':'); 
    const iv = Buffer.from(parts.shift(), 'hex'); 
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
};
