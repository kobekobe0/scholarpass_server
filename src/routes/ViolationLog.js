import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { logViolation } from '../controllers/mutation/violation.mutation.js';
import { getStudentViolations, getViolations } from '../controllers/query/violation.query.js';

const violationLogRouter = express.Router();

violationLogRouter.post('/', logViolation)
violationLogRouter.get('/', getViolations)
violationLogRouter.get('/student/:id', getStudentViolations)

export default violationLogRouter;