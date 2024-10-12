import StudentLog from "../../models/StudentLog.js";
import ViolationLog from "../../models/ViolationLog.js";
import Vehicle from "../../models/Vehicle.js";
import Student from "../../models/Student.js";
import VisitorQR from "../../models/VisitorQR.js";

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

export const getStudentForLogging = async (req, res) => {
    const {studentID, vehicleID} = req.query // qrCode

    try{
        let vehicle = null
        const student = await Student.findById(studentID)
        if(!student) return res.status(404).json({message: 'Student not found'})

        if(vehicleID) {
            vehicle = await Vehicle.findById(vehicleID).select('model color plateNumber image')
            if(!vehicle) return res.status(404).json({message: 'Vehicle not found'})
        }

        return res.status(200).json({student, vehicle})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error, message: 'getStudentForLogging'})
    }
}

export const getVisitorForLogging = async (req, res) => {
    const {visitorCardID} = req.params // qrCode

    try{
        const visitorCard = await VisitorQR.findOne({visitorCardID})

        if(!visitorCard) return res.status(404).json({message: 'Visitor not found'})
        
        return res.status(200).json({visitorCard})

    } catch (error) {
        console.log(error)
        return res.status(500).json({error, message: 'getVisitorForLogging'})
    }
}