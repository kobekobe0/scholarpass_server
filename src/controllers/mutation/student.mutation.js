import SystemLog from "../../models/SystemLog.js";
import Student from "../../models/Student.js";
import Vehicle from "../../models/Vehicle.js";
import { createSystemLog } from "../../middleware/createSystemLog.js";
import bcrypt from 'bcryptjs';

//register
export const createStudent = async (req, res) => {
    const student = req.body;
    const pfpPath = `${req.filename}`;
    const schedule = JSON.parse(student.schedule);

    try {
        const studentExists = await Student.findOne({ studentNumber: student.studentNumber });
        if(studentExists){
            return res.status(400).json({ message: `Account with student number ${student.studentNumber} already exists` });
        }

        const emailExists = await Student.findOne({ email: student.email });
        if(emailExists){
            return res.status(400).json({ message: `Account with email ${student.email} already exists` });
        }

        const hashedPassword = await bcrypt.hash(student.password, 12);

        const newStudent = await Student.create({
            name: student.name,
            cellphone: student.cellphone,
            schedule: schedule,
            email: student.email,
            studentNumber: student.studentNumber,
            department: student.department,
            password: hashedPassword,
            pfp: pfpPath,
            degree: student.degree,
            section: student.section,
            yearLevel: student.yearLevel,
            SY: {
                start: student.start,
                end: student.end,
                semester: student.semester
            }
        });

        if(newStudent){
            await createSystemLog('CREATE', 'Student', newStudent._id, 'Student', 'Student created', null);
        } else {
            return res.status(400).json({ message: 'Failed to create student' });
        }

        return res.status(201).json({ message: 'Account created successfully'});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to create student' });
    }
}

const checkCompleteRegistration = async (id) => {
    const student = await Student.findById(id);
    //check fields
    if(student.name.first && student.name.last && student.cellphone && student.email && student.studentNumber && student.department && student.pfp){
        const studentVehicle = await Vehicle.findOne({ studentID: id });
        if(studentVehicle){
            student.completeRegistration = true;
            await student.save();
        }
    }
}

export const updateStudent = async (req, res) => {
    const { id } = req.params;
    const student = req.body;

    try {
        const updatedStudent = await Student.findByIdAndUpdate(id, {
            ...student,
            valid: true
        }, { new: true });
        if(updatedStudent){
            await createSystemLog('UPDATE', 'Student', updatedStudent._id, 'Student', 'Student updated', null);
        } else {
            return res.status(400).json({ message: 'Failed to update student' });
        }

        await checkCompleteRegistration(id);

        return res.status(200).json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update student' });
    }
}

export const deleteStudent = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedStudent = await Student.findByIdAndUpdate(id, { deleted: true }, { new: true });
        if(deletedStudent){
            await createSystemLog('DELETE', 'Student', deletedStudent._id, 'Student', 'Student deleted', null);
        } else {
            return res.status(400).json({ message: 'Failed to delete student' });
        }

        return res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to delete student' });
    }
}

export const updatePfp = async (req, res) => {
    const { id } = req.params;
    const pfpPath = `${req.filename}`;
    try {
        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const lastUpdate = new Date(student.lastPfpUpdate);
        const now = new Date();

        // Get the difference in months between now and lastUpdate
        const monthsDifference = (now.getFullYear() - lastUpdate.getFullYear()) * 12 + (now.getMonth() - lastUpdate.getMonth());

        if (monthsDifference < 1 && (now - lastUpdate) < 2592000000) {
            return res.status(400).json({ message: 'You can only update your profile picture once a month' });
        }

        student.pfp = pfpPath;
        student.lastPfpUpdate = new Date();
        const updatedStudent = await student.save();

        if (updatedStudent) {
            await createSystemLog('UPDATE', 'Student', updatedStudent._id, 'Student', 'Profile picture updated', null);
        } else {
            return res.status(400).json({ message: 'Failed to update profile picture' });
        }

        await checkCompleteRegistration(id);

        return res.status(200).json({ message: 'Profile picture updated successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update profile picture' });
    }
}

export const updatePassword = async (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    try {
        const student = await Student.findById(id);
        if(!student)return res.status(404).json({ message: 'Student not found' });

        const isMatch = await bcrypt.compare(oldPassword, student.password);

        if(!isMatch) return res.status(400).json({ message: 'Incorrect password' });
        
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        student.password = hashedPassword;

        const updatedStudent = await student.save();

        if(updatedStudent){
            await createSystemLog('UPDATE', 'Student', updatedStudent._id, 'Student', 'Password updated', null);
        }

        return res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update password' });
    }
}


export const updatePfpByAdmin = async (req, res) => {
    const { id } = req.params;
    const pfpPath = `${req.filename}`;
    try {
        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        student.pfp = pfpPath;
        await student.save();

        await createSystemLog('UPDATE', 'Student', student._id, 'Student', 'Profile picture updated by admin', null);
        return res.status(200).json({ message: 'Profile picture updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update profile picture' });
    }
}

export const updatePasswordByAdmin = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    console.log(newPassword)

    try {
        console.log("updating password")
        const student = await Student.findById(id);
        if(!student)return res.status(404).json({ message: 'Student not found' });
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        student.password = hashedPassword;
        const updatedStudent = await student.save();

        if(updatedStudent)return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update password' });
    }

}