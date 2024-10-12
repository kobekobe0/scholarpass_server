//recent logs
//student 5 recent logs
//number of registered vehicles
//number of pending card request
//number of pending card request student
//number of violation student
//number of violation

import Vehicle from "../../models/Vehicle.js";
import CardRequest from "../../models/CardRequest.js";
import ViolationLog from "../../models/ViolationLog.js";
import StudentLog from "../../models/StudentLog.js";

export const getRecentLogs = async (req, res) => {
    const { studentID } = req.params;

    try {
        const logs = await StudentLog.find({ studentID }).sort({ createdAt: -1 }).limit(5).populate('vehicle');
        return res.status(200).json(logs);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error fetching logs", error: error.message });
    }
}

export const getStudentLogs = async (req, res) => {
    const { studentID } = req.params;

    try {
        const logs = await StudentLog.find({ studentID });
        return res.status(200).json(logs);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error fetching logs", error: error.message });
    }
}

export const getVehicleCount = async (req, res) => {
    const { studentID } = req.params;

    try {
        const count = await Vehicle.countDocuments({ studentID });
        return res.status(200).json({ count });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error fetching vehicle count", error: error.message });
    }
}

export const getPendingCardRequestCount = async (req, res) => {
    const { studentID } = req.params;

    try {
        const count = await CardRequest.countDocuments({ studentID, status: 'Pending' });
        return res.status(200).json({ count });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error fetching pending card request count", error: error.message });
    }
}

export const getViolationCount = async (req, res) => {
    const { studentID } = req.params;

    try {
        const count = await ViolationLog.countDocuments({ studentID });
        return res.status(200).json({ count });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error fetching violation count", error: error.message });
    }
}

export const getViolation = async (req, res) => {
    const { studentID } = req.params;

    try {
        const violations = await ViolationLog.find({ studentID });
        return res.status(200).json(violations);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error fetching violations", error: error.message });
    }
}