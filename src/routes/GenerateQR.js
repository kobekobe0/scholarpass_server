import express from 'express';
import { qrGenerateStudent, qrGenerateVisitor } from '../controllers/query/qrGenerate.js';

const qrRouter = express.Router();

qrRouter.post('/visitor-card', qrGenerateVisitor);
qrRouter.post('/student-card', qrGenerateStudent);

export default qrRouter;