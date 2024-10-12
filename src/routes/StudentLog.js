import express from "express";
import { checkVisitorQR, logStudent, logVisitor } from "../controllers/mutation/studentEntry.mutation.js";
import { getStudentLogs, getStudentViolation } from "../controllers/query/studentLogs.query.js";

const studentLogRouter = express.Router();

//TODO: Add security guard validation
studentLogRouter.post('/student', logStudent)
studentLogRouter.post('/visitor/:id', checkVisitorQR)
studentLogRouter.post('/visitor', logVisitor)

studentLogRouter.get('/student/:id', getStudentLogs)
studentLogRouter.get('/violation/:id', getStudentViolation)

export default studentLogRouter;