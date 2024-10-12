import StudentLog from "../../models/StudentLog.js";
import ViolationLog from "../../models/ViolationLog.js";

export const getStudentLogs = async (req, res) => {
    const {id} = req.params
    try {
        const logs = await StudentLog.find({studentID: id}).populate('studentID', 'name studentNumber').populate('vehicle', 'model').sort({timeIn: -1})
        return res.status(200).json(logs)
    } catch(error) {
        console.log(error)
        return res.status(500).json({error, message: 'getStudentLogs'})
    }
} 

export const getStudentViolation = async (req, res) => {
    const {id} = req.params
    try {
        const logs = await ViolationLog.find({studentID: id}).populate('studentID', 'name studentNumber').sort({createdAt: -1})
        return res.status(200).json(logs)
    } catch (error) {
        console.log(error)
        return res.status(500).json({error, message: 'getStudentViolation'})
    }
}