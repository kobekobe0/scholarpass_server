import express from "express";
import { checkVisitorQR, createVisitorQR, getRecentLogs, getRecentVisitors, getStatisticsToday, logStudent, logViolation, logVisitor } from "../controllers/mutation/studentEntry.mutation.js";
import { getCurrentDayLogsGroupedByTimeIn, getCurrentNumberOfVehicleInside, getLogs, getStudentForLogging, getStudentLogs, getStudentViolation, getVisitorForLogging } from "../controllers/query/studentLogs.query.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { guardAuth } from "../middleware/guardAuth.js";

const studentLogRouter = express.Router();

//TODO: Add security guard validation
studentLogRouter.post('/student', guardAuth, logStudent)
studentLogRouter.post('/visitor-qr/create', createVisitorQR)
studentLogRouter.post('/visitor/:id', guardAuth, logVisitor)
studentLogRouter.post('/violation', logViolation)

studentLogRouter.get('/student/:id', getStudentLogs)
studentLogRouter.get('/violation/:id', getStudentViolation)

studentLogRouter.get('/logging/student', getStudentForLogging)
studentLogRouter.get('/logging/visitor/:visitorCardID', getVisitorForLogging)

studentLogRouter.get('/statistics', getStatisticsToday)

studentLogRouter.get('/recent-logs', getRecentLogs)

studentLogRouter.get('/recent-visitor', getRecentVisitors)

studentLogRouter.post('/log-trend', getCurrentDayLogsGroupedByTimeIn)

studentLogRouter.get('/logs', getLogs)

studentLogRouter.get('/vehicle-number', getCurrentNumberOfVehicleInside)
export default studentLogRouter;