import express from 'express';
import { cancelRequest, createCardRequest, deleteCardRequest, updateCardRequest } from '../controllers/mutation/cardRequest.mutation.js';
import { studentAuth } from '../middleware/studentAuth.js';
import { getRequest, getRequestsByStatus, getStudentRequests } from '../controllers/query/cardRequest.query.js';

const cardRequestRouter = express.Router();

//TODO: add auth
cardRequestRouter.post('/create', studentAuth, createCardRequest);
cardRequestRouter.put('/update/:id', updateCardRequest);
cardRequestRouter.put('/delete/:id', deleteCardRequest);
cardRequestRouter.put('/cancel/:id', cancelRequest);

cardRequestRouter.get('/student/:studentID', getStudentRequests);
cardRequestRouter.get('/single/:id', getRequest);
cardRequestRouter.get('/status/:status', getRequestsByStatus);

export default cardRequestRouter;