import express from "express";
import { createResetPassword, createResetPasswordAdmin, resetPassword, resetPasswordAdmin } from "../controllers/mutation/resetpassword.mutation.js";


const resetPasswordRouter = express.Router();

resetPasswordRouter.post('/create', createResetPassword)
resetPasswordRouter.post('/renew/:resetPasswordId', resetPassword)

resetPasswordRouter.post('/create-admin', createResetPasswordAdmin)
resetPasswordRouter.post('/renew-admin/:resetPasswordId', resetPasswordAdmin)

export default resetPasswordRouter;