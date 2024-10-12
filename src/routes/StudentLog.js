import express from "express";
import { checkVisitorQR, createVisitorQR, logStudent, logViolation, logVisitor } from "../controllers/mutation/studentEntry.mutation.js";
import { getStudentForLogging, getStudentLogs, getStudentViolation, getVisitorForLogging } from "../controllers/query/studentLogs.query.js";

const studentLogRouter = express.Router();

//TODO: Add security guard validation
studentLogRouter.post('/student', logStudent)
studentLogRouter.post('/visitor/:id', checkVisitorQR)
studentLogRouter.post('/visitor-qr/create', createVisitorQR)
studentLogRouter.post('/visitor', logVisitor)
studentLogRouter.post('/violation', logViolation)

studentLogRouter.get('/student/:id', getStudentLogs)
studentLogRouter.get('/violation/:id', getStudentViolation)

studentLogRouter.get('/logging/student', getStudentForLogging)
studentLogRouter.get('/logging/visitor/:visitorCardID', getVisitorForLogging)

export default studentLogRouter;