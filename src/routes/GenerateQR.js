import express from 'express';
import { qrGenerateVisitor } from '../controllers/query/qrGenerate.js';

const qrRouter = express.Router();

qrRouter.post('/visitor-card', qrGenerateVisitor);

export default qrRouter;