import express from "express";
import { checkVisitorQR, logStudent, logVisitor } from "../controllers/mutation/studentEntry.mutation.js";

const studentLog = express.Router();

//TODO: Add security guard validation
studentLog.post('/student', logStudent)
studentLog.post('/visitor/:id', checkVisitorQR)
studentLog.post('/visitor', logVisitor)

export default studentLog;