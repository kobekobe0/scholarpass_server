import Admin from "../../models/Admin.js";
import bcrypt from 'bcryptjs';

export const updateAdminEmail = async (req, res) => {
    const { _id } = req.user;
    const {email, password} = req.body;

    try {

        const admin = await Admin.findById(_id);
        if(!admin) return res.status(404).json({ message: 'Admin not found' });
        const isMatch = await bcrypt.compare(password, admin.password);

        if(!isMatch) return res.status(400).json({ message: 'Incorrect password' });

        admin.email = email;
        const updatedAdmin = await admin.save();
        
        if(!updatedAdmin) return res.status(400).json({ message: 'Failed to update admin' });

        return res.status(200).json({ message: 'Admin updated successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update admin' });
    }
}

export const updateAdminPassword = async (req, res) => {
    const { _id } = req.user;
    const {oldPassword, newPassword} = req.body;

    try {

        const admin = await Admin.findById(_id);
        if(!admin) return res.status(404).json({ message: 'Admin not found' });
        const isMatch = await bcrypt.compare(oldPassword, admin.password);

        if(!isMatch) return res.status(400).json({ message: 'Incorrect password' });

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        admin.password = hashedPassword;
        const updatedAdmin = await admin.save();
        
        if(!updatedAdmin) return res.status(400).json({ message: 'Failed to update admin' });

        return res.status(200).json({ message: 'Admin updated successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update admin' });
    }
}