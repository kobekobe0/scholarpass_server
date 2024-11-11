import express from "express";
import { createSecurityGuard, deleteSecurityGuard, loginSecurityGuard, toggleGuardAccount, updatePasswordSecurityGuard, updateSecurityGuard } from "../controllers/mutation/securityGuard.mutation.js";
import { guardAuth } from "../middleware/guardAuth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { getSecurityGuard, getSecurityGuards } from "../controllers/query/guard.query.js";

const securityGuardRouter = express.Router();

//TODO: Add security guard validation

//admin
securityGuardRouter.post('/create', adminAuth, createSecurityGuard)

securityGuardRouter.post('/login', loginSecurityGuard)

//admin
securityGuardRouter.post('/toggle/:id', adminAuth, toggleGuardAccount)

//admin
securityGuardRouter.put('/update/:id', adminAuth, updateSecurityGuard)

//security guard
securityGuardRouter.put('/change-password/:id', adminAuth, updatePasswordSecurityGuard)

securityGuardRouter.get('/', adminAuth, getSecurityGuards)
securityGuardRouter.get('/:id', adminAuth, getSecurityGuard)
securityGuardRouter.delete('/:id/:adminPassword', adminAuth, deleteSecurityGuard)

export default securityGuardRouter;