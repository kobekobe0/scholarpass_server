import express from 'express';
import { getAdmin, loginAdmin, verifyJWT } from '../controllers/query/admin.query.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { updateAdminEmail, updateAdminPassword } from '../controllers/mutation/admin.mutation.js';

const adminRouter = express.Router();

adminRouter.post('/login', loginAdmin)
adminRouter.post('/verify', verifyJWT)

adminRouter.put('/email', adminAuth, updateAdminEmail)
adminRouter.put('/password', adminAuth, updateAdminPassword)

adminRouter.get('/', adminAuth, getAdmin)

export default adminRouter;