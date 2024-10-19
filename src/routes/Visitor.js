import express from 'express';
import { getVisitorLogByCardID, getVisitorLogs, getVisitorQR, getVisitorQRs } from '../controllers/query/visitor.query.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { createQR, deleteQR, logVisitor, toggleQR } from '../controllers/mutation/visitor.mutation.js';

const visitorRouter = express.Router();

visitorRouter.get('/qr', adminAuth, getVisitorQRs)
visitorRouter.post('/qr', adminAuth, createQR)
visitorRouter.delete('/qr', adminAuth, deleteQR)
visitorRouter.patch('/qr/:id', adminAuth, toggleQR)

visitorRouter.get('/qr/:id', getVisitorQR)
visitorRouter.post('/log', logVisitor)

visitorRouter.get('/logs', adminAuth, getVisitorLogs)
visitorRouter.get('/qr/history/:id', getVisitorLogByCardID)



export default visitorRouter;