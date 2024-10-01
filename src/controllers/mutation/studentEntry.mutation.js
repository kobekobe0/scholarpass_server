import StudentLog from '../../models/studentLog.js';
import ViolationLog from '../../models/ViolationLog.js';
import VisitorQR from '../../models/VisitorQR.js';
import VisitorLog from '../../models/VisitorLog.js';
import { io } from '../../index.js';


//body should look like

/*
studentID: String,
violation: [String],
vehicle: String
*/

const createViolationLog = async (student) => {
    const newViolation = await ViolationLog.create({
        studentID: student.studentID,
        violation: student.violation,
    });
    return newViolation;
}

const createStudentLog = async (student) => {
    let studentLog;
    if(student.violation){
        const newViolation = await createViolationLog(student);
        
        studentLog = {
            studentID: student.studentID,
            timeIn: new Date(),
            violationID: newViolation._id,
            vehicle: student?.vehicle
        }

    } else {
        studentLog = {
            studentID: student.studentID,
            timeIn: new Date(),
        }
    }

    return await StudentLog.create(studentLog);
}

const logOutStudent = async (studentLog) => {
    try{
        studentLog.timeOut = new Date();
        studentLog.save();
    } catch (error) {
        throw new Error("Failed to log out student");
    }

}

export const logStudent = async (req, res) => {
    try {
    const student = req.body;
    console.log(student);
    let studentLog

    //check last student log of student
    const lastLog = await StudentLog.findOne({studentID: student.studentID}).sort({timeIn: -1});
    
    //on first enter
    if(!lastLog){
        studentLog = await createStudentLog(student);
        return res.status(200).json({message: "Student logged in"});
    }

    //TODO: handle case where it is another day
    if(lastLog.timeIn.getDate() != new Date().getDate()){
        //log out student
        await logOutStudent(lastLog);
        studentLog = await createStudentLog(student);
        return res.status(200).json({message: "Student logged in"});
    }

    if(!lastLog.timeOut){
        //log out student
        await logOutStudent(lastLog);
        //TODO: return populated student with pic
        return res.status(200).json({message: "Student logged out"});
    }
    
    // log in student
    studentLog = await createStudentLog(student);
    return res.status(200).json({message: "Student logged in"});

    } catch (error) {
        return res.status(500).json({ message: "Failed to log student", error: error.message });
    }
}

export const createVisitorQR = async (req, res) => {
    try{
        const visitorCardCount = await VisitorQR.countDocuments();
        const visitorQR = await VisitorQR.create({
            visitorID: visitorCardCount + 1,
        });
        return res.status(200).json({ visitorQR });
    } catch (error) {
        return res.status(500).json({ message: "Failed to create visitor QR", error: error.message });
    }
}

export const checkVisitorQR = async (req, res) => {
    try {
        const { id } = req.params;
        const visitorQR = await VisitorQR.findById(id);
        if (!visitorQR) {
            return res.status(404).json({ message: "Invalid Visitor Card" });
        }

        return res.status(200).json({ visitorQR });
    } catch (error) {
        return res.status(500).json({ message: "Failed to check visitor QR", error: error.message });
    }
}

const createVisitorLog = async (visitor, cardID) => {
    const visitorLog = await VisitorLog.create({
        name: visitor?.name,
        purpose: visitor?.purpose,
        vehicle: visitor?.vehicle,
        visitorCardID: cardID,
        plateNumber: visitor?.plateNumber,
    });
    return visitorLog;
}

export const logVisitor = async (req, res) => {
    const visitor = req.body;
    const cardID = req.params.id;

    try {
        //get latest visitor log associated with card
        const lastLog = await VisitorLog.findOne({
            visitorCardID: cardID,
        }).sort({timeIn: -1});

        //if no log found
        if(!lastLog){
            const visitorLog = await createVisitorLog(visitor, cardID);
            return res.status(200).json({ message: "Visitor logged in" });
        }

        //if visitor has not logged out
        if(!lastLog.timeOut){
            lastLog.timeOut = new Date();
            lastLog.save();
            return res.status(200).json({ message: "Visitor logged out" });
        }

        //log in visitor
        const visitorLog = await createVisitorLog(visitor, cardID);
        return res.status(200).json({ message: "Visitor logged in" });

    } catch (error){
        return res.status(500).json({ message: "Failed to log visitor", error: error.message });
    }
}
