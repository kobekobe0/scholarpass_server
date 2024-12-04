import StudentLog from "../../models/StudentLog.js";
import ViolationLog from "../../models/ViolationLog.js";
import Vehicle from "../../models/Vehicle.js";
import Student from "../../models/Student.js";
import VisitorQR from "../../models/VisitorQR.js";
import paginate from "../../helper/paginate.js";

export const getStudentLogs = async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 100, startDate, endDate, search = '' } = req.query;

    try {
        let query = { studentID: id };

        if (startDate && endDate) {
            query.logDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (startDate) {
            query.logDate = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.logDate = { $lte: new Date(endDate) };
        }

        // Call the paginate function with model, query, and pagination options
        const logs = await paginate(StudentLog, query, { page, limit, sort: { timeIn: -1 }, populate: 'vehicle' }, search);
        console.log(logs);
        return res.status(200).json(logs);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, message: 'Failed to fetch student logs' });
    }
};
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
    let {studentID, vehicleID, studentNumber} = req.query // qrCode

    try{
        let vehicle = null
        if(!studentID){
            if(studentNumber) {
                const student = await Student.findOne({studentNumber})
                if(!student) return res.status(404).json({message: 'Student not found'})
                studentID = student._id
            } else {
                return res.status(400).json({message: 'Student ID or Student Number is required'})
            }
        }
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

export const getCurrentDayLogsGroupedByTimeIn = async (req, res) => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 6, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0, 0);

    const timeSlots = [];
    for (let hour = 6; hour < 20; hour++) {
        timeSlots.push({ hour, minute: 0 });
        timeSlots.push({ hour, minute: 30 });
    }

    try {
        const logs = await StudentLog.aggregate([
            {
                $match: {
                    timeIn: { $gte: start, $lt: end }
                }
            },
            {
                $project: {
                    timeIn: {
                        $dateToString: {
                            format: "%H:%M",
                            date: "$timeIn",
                            timezone: "Asia/Manila"  // Make sure the time is formatted based on Manila timezone
                        }
                    }
                }
            },
            {
                $project: {
                    hour: { $toInt: { $substr: ["$timeIn", 0, 2] } },  // Extract hour
                    minute: { $toInt: { $substr: ["$timeIn", 3, 2] } }  // Extract minute
                }
            },
            {
                $project: {
                    hour: 1,
                    timeSlot: {
                        $cond: [
                            { $lt: ["$minute", 30] },  // If the minute is less than 30, group in the first half
                            0,                         // 0 for :00-:29
                            30                         // 30 for :30-:59
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        hour: "$hour",
                        minute: "$timeSlot"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.hour": 1,
                    "_id.minute": 1
                }
            }
        ]);

        // Create a map from logs for quick lookup
        const logMap = new Map();
        logs.forEach(log => {
            const key = `${log._id.hour}:${log._id.minute}`;
            logMap.set(key, log.count);
        });

        // Combine the generated time slots with the log data
        const finalLogs = timeSlots.map(slot => {
            const key = `${slot.hour}:${slot.minute}`;
            return {
                hour: slot.hour,
                minute: slot.minute,
                count: logMap.get(key) || 0  // Use 0 if no logs found for this time slot
            };
        });

        return res.status(200).json(finalLogs);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error, message: 'getCurrentDayLogsGroupedByTimeIn' });
    }
};

export const getLogs = async (req, res) => {
    const { limit = 100, page = 1, studentName = '', from = '', to = '' } = req.query;

    try {
        const totalDocs = await StudentLog.countDocuments();
        const totalPages = Math.ceil(totalDocs / limit);
        
        // Prepare filters based on the request query
        const studentNameFilter = studentName
            ? { 'name': { $regex: studentName, $options: 'i' } }
            : {};
        
        // Prepare date range filter
        const dateFilter = {};
        if (from) {
            dateFilter['$gte'] = new Date(from); // Filter for dates greater than or equal to 'from'
        }
        if (to) {
            dateFilter['$lte'] = new Date(to); // Filter for dates less than or equal to 'to'
        }
        
        // Modify the logs query with the date filter
        const logs = await StudentLog.find({
            ...(from || to ? { logDate: dateFilter } : {}), // Apply date range filter if 'from' or 'to' is provided
        })
            .populate({
                path: 'studentID',
                select: 'name studentNumber department guard',
                match: studentNameFilter 
            })
            .populate('vehicle', 'model')
            .sort({ timeIn: -1 })
            .limit(parseInt(limit)) 
            .skip((parseInt(page) - 1) * limit);

        // Filter out logs where the studentID population returned null (no match for studentName)
        const filteredLogs = logs.filter(log => log.studentID !== null);

        console.log(filteredLogs[0])

        // Return totalPages, totalDocs, docs
        return res.status(200).json({ totalPages, totalDocs, docs: filteredLogs });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, message: 'getLogs' });
    }
};

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

export const getCurrentNumberOfVehicleInside = async (req, res) => {
    try {
        const startOfTheDay = new Date();
        startOfTheDay.setHours(0, 0, 0, 0);

        const logsWithVehicle = await StudentLog.find({
            timeIn: {
                $gte: startOfTheDay
            },
            timeOut: {
                $eq: null
            },
            vehicle: { $ne: null }
        }).countDocuments();

        return res.status(200).json({ count: logsWithVehicle });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, message: 'getCurrentNumberOfVehicleInside' });
    }
}