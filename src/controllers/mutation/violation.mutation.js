import ViolationLog from "../../models/ViolationLog.js";

export const logViolation = async (req, res) => {
    const {studentID, severity, violation} = req.body;
    //const {_id} = req.user; 

    try {
        console.log(req.body)
        const newViolationLog = await ViolationLog.create({
            studentID,
            violation,
            severity
        });

        if(newViolationLog){
            return res.status(201).json({ message: 'Violation logged successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to log violation' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to log violation' });
    }
}