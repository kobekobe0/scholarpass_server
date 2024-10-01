import jwt from 'jsonwebtoken';
import SecurityGuard from '../models/SecurityGuard.js';
const SECRET_KEY = process.env.SECRET_KEY;

export const guardAuth = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const guard = await SecurityGuard.findById(decoded._id);
        if (!guard) return res.status(404).json({ message: "Unauthorized" });
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: "Unauthorized" });
    }
}