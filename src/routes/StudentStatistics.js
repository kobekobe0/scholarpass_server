import express from "express";
import { studentAuth } from "../middleware/studentAuth.js";
import { getPendingCardRequestCount, getRecentLogs, getStudentLogs, getVehicleCount, getViolation, getViolationCount } from "../controllers/query/student_statistics.query.js";

const studentStatisticsRouter = express.Router();

studentStatisticsRouter.get('/registered-vehicles/:studentID', getVehicleCount)
studentStatisticsRouter.get('/recent-logs/:studentID', getRecentLogs)
studentStatisticsRouter.get('/logs/:studentID', getStudentLogs)
studentStatisticsRouter.get('/pending-card-request-count/:studentID', getPendingCardRequestCount)
studentStatisticsRouter.get('/violation-count/:studentID', getViolationCount)
studentStatisticsRouter.get('/violation/:studentID', getViolation)

export default studentStatisticsRouter;