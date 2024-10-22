import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { getConfig } from '../controllers/query/config.query.js';
import { addViolation, deleteViolation, updateSY, updateViolation } from '../controllers/mutation/config.mutation.js';

const configRouter = express.Router();

configRouter.get('/', getConfig);

configRouter.put('/sy', adminAuth, updateSY)

configRouter.post('/violation/create', adminAuth, addViolation)

configRouter.put('/violation', adminAuth, updateViolation)

configRouter.delete('/violation/:id', adminAuth, deleteViolation)

export default configRouter;