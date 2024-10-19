import generateAuthToken from '../../helper/generateAuthToken.js';
import Admin from '../../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: "Error fetching admins", error: error.message });
    }
}

export const getAdmin = async (req, res) => {
    const { _id } = req.user;

    try {
        const admin = await Admin.findById(_id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: "Error fetching admin", error: error.message });
    }
}

export const verifyJWT = async (req, res) => {
    const {token} = req.body;
    try {
        console.log(token, process.env.SECRET_KEY)
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log(decoded)
        req.user = decoded;
        const user = await Admin.findById(decoded._id)
        res.status(200).json({ message: "Token is valid", success: true, user });
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: "Unauthorized", success: false });
    }
}


export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(404).json({ message: "Admin not found" });
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = await generateAuthToken(admin, "Admin");
        return res.status(200).json({ message: "Login successful", token: token });

    } catch (error) {
        res.status(500).json({ message: "Error logging in admin", error: error.message });
    }
}


