import Config from "../../models/Config.js";
import Admin from "../../models/Admin.js";
import bcrypt from 'bcryptjs';
import Student from "../../models/Student.js";
import ViolationLog from "../../models/ViolationLog.js";

export const updateSY = async (req, res) => {
    const { start, end, semester, password } = req.body;
    try {
        const admin = await Admin.findById(req.user._id);
        if(!admin) return res.status(404).json({ message: 'Admin not found' });
        const isMatch = await bcrypt.compare(password, admin.password);
        if(!isMatch) return res.status(400).json({ message: 'Incorrect password' });
        const config = await Config.findOne();
        if(config.SY.start === start && config.SY.end === end && config.SY.semester === semester){
            return res.status(400).json({ message: 'No changes made' });
        }

        if(!config) return res.status(404).json({ message: 'Config not found' });
        if(start) config.SY.start = start;
        if(end) config.SY.end = end;
        if(semester) config.SY.semester = semester;
        await config.save();

        const studentObsolete = await Student.updateMany({}, {valid: false});
        const violationObsolete = await ViolationLog.updateMany({}, {current: false});
        // update all student.valid = false



        return res.status(200).json({ message: 'School year updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update school year' });
    }
}

export const addViolation = async (req, res) => {
    const {violations} = req.body;

    try {
        const config = await Config.findOne();
        if(!config) return res.status(404).json({ message: 'Config not found' });
        for(const violation of violations){
            config.violations.push(violation);
        }
        await config.save();

        return res.status(200).json({ message: 'Violation added successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to add violation' });
    }
}

export const updateViolation = async (req, res) => {
    const {id} = req.params;
    const violations = req.body;

    try {
        const config = await Config.findOne();
        if(!config) return res.status(404).json({ message: 'Config not found' });
        
        config.violationTypes = violations;
        const newConfig = await config.save();



        console.log(newConfig);
        return res.status(200).json({ message: 'Violation updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update violation' });
    }
}

export const deleteViolation = async (req, res) => {
    const {id} = req.params;

    try {
        const config = await Config.findOne();
        if(!config) return res.status(404).json({ message: 'Config not found' });
        const index = config.violations.findIndex(v => v._id == id);
        if(index === -1) return res.status(404).json({ message: 'Violation not found' });

        config.violations.splice(index, 1);
        await config.save();

        return res.status(200).json({ message: 'Violation deleted successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to delete violation' });
    }
}

