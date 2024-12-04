import StudentLog from '../../models/StudentLog.js';
import ViolationLog from '../../models/ViolationLog.js';
import VisitorQR from '../../models/VisitorQR.js';
import VisitorLog from '../../models/VisitorLog.js';
import { io } from '../../index.js';

const createStudentLog = async (studentID, vehicleID, name) => {
    const today = new Date();
    const newLog = await StudentLog.create({
        studentID,
        vehicle: vehicleID || null,
        timeIn: new Date(),
        logDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        guard: name
    })
    return newLog;
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
        const { studentID, vehicleID, status } = req.body;
        const { name } = req.user;

        if(status == "IN") {
            const newLog = await createStudentLog(studentID, vehicleID, name);
            if(!newLog) return res.status(500).json({ message: "Failed to log student" });
            return res.status(200).json({ log: newLog })
        } else if(status == "OUT") {
            const studentLog = await StudentLog.findOne({ studentID }).sort({timeIn: -1});
            if(!studentLog) {
                const newLog = await createStudentLog(studentID, vehicleID);
                if(!newLog) return res.status(500).json({ message: "Failed to log student" });
                return res.status(200).json({ log: newLog })
            }   
            await logOutStudent(studentLog);
            return res.status(200).json({ log: studentLog })   
        }
    } catch (error) {
        return res.status(500).json({ message: "Failed to log student", error: error.message });
    }
};


export const createVisitorQR = async (req, res) => {
    try{
        const visitorCardCount = await VisitorQR.countDocuments();
        const visitorQR = await VisitorQR.create({
            cardNumber: visitorCardCount + 1,
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

const createVisitorLog = async (visitor, cardID, guard) => {
    const visitorLog = await VisitorLog.create({
        name: visitor?.name,
        purpose: visitor?.purpose,
        visitorCardID: cardID,
        timeIn: new Date(),
        address: visitor?.address,
        personToVisit: visitor?.personToVisit,
        number: visitor?.number,
        agency: visitor?.agency,
        guard: guard
    });
    return visitorLog;
}

export const logVisitor = async (req, res) => {
    const {visitor} = req.body;
    const cardID = req.params.id;
    const {name} = req.user;

    try {
        const cardQR = await VisitorQR.findById(cardID);
        if(!cardQR) return res.status(404).json({ message: "Invalid Visitor Card" });

        const lastLog = await VisitorLog.findOne({ visitorCardID: cardID }).sort({timeIn: -1});
        if(lastLog.timeOut == null && lastLog.timeIn != null) {
            //log out visitor
            lastLog.timeOut = new Date();
            lastLog.save();
            return res.status(200).json({ message: "Visitor logged out" });
        }

        const newLog = await createVisitorLog(visitor, cardID, name);
        if(!newLog) return res.status(500).json({ message: "Failed to log visitor" });
        cardQR.inUse = true;
        await cardQR.save();

        io.emit('visitor-in', newLog);

        return res.status(200).json({ log: newLog });

    } catch (error){
        return res.status(500).json({ message: "Failed to log visitor", error: error.message });
    }
}

const createViolationLog = async (studentID, violation) => {
    const newViolation = await ViolationLog.create({
        studentID: studentID,
        violation: violation,
    });
    return newViolation;
}


export const logViolation = async (req, res) => {
    const { studentID, violation } = req.body;

    try {
        const newViolation = await createViolationLog(studentID, violation );
        if(!newViolation) return res.status(500).json({ message: "Failed to log violation" });
        return res.status(200).json({ violation: newViolation });
    } catch (error) {
        return res.status(500).json({ message: "Failed to log violation", error: error.message });
    }
}


export const getStatisticsToday = async (req, res) => {
    try {
        // Set start and end of the day in Manila time
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        // Filter logs within today's date range
        const logs = await StudentLog.find({
            logDate: { $gte: startOfDay, $lte: endOfDay }
        }).select('studentID vehicle');

        // Get unique students and vehicles
        const uniqueStudents = new Set();
        const uniqueVehicles = new Set();
        for (let log of logs) {
            uniqueStudents.add(log.studentID);
            if (log.vehicle) uniqueVehicles.add(log.vehicle);
        }

        // Count visitor logs within today's date range
        const totalVisitors = await VisitorLog.countDocuments({
            logDate: { $gte: startOfDay, $lte: endOfDay }
        });

        return res.status(200).json({
            totalLogs: logs.length,
            uniqueStudents: uniqueStudents.size,
            uniqueVehicles: uniqueVehicles.size,
            totalVisitors
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to get statistics", error: error.message });
    }
};


export const getRecentLogs = async (req, res) => {
    //accept number of logs to return
    const { limit } = req.query;

    try {
        const logs = await StudentLog.find().populate('studentID', 'name department').populate('vehicle', 'model').sort({timeIn: -1}).limit(parseInt(limit));
        return res.status(200).json(logs);
    } catch (error) {
        return res.status(500).json({ message: "Failed to get recent logs", error: error.message });
    }
}

export const getRecentVisitors = async (req, res) => {
    //accept number of logs to return
    const { limit } = req.query;

    try {
        const logs = await VisitorLog.find().sort({timeIn: -1}).limit(parseInt(limit));
        return res.status(200).json(logs);
    } catch (error) {
        return res.status(500).json({ message: "Failed to get recent visitors", error: error.message });
    }
}