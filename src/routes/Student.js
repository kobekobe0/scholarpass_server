import express from "express";
import { createStudent, deleteStudent, updatePassword, updatePasswordByAdmin, updatePfp, updatePfpByAdmin, updateStudent } from "../controllers/mutation/student.mutation.js";
import { getStudent, verifyJWT, getStudents, loginStudent, getSelf } from "../controllers/query/student.query.js";
import parseCOR from "../middleware/parseCOR.js";
import { processImage, uploadSingleImage } from "../middleware/uploadImage.js";
import { studentAuth } from "../middleware/studentAuth.js";
import { adminAuth } from "../middleware/adminAuth.js";

const studentRouter = express.Router();

//add auth here to verify the token

studentRouter.post('/login', loginStudent)
studentRouter.post('/verify', verifyJWT)
studentRouter.post('/create', uploadSingleImage, processImage, createStudent)
studentRouter.put('/update/:id', updateStudent)
studentRouter.delete('/delete/:id', deleteStudent)
studentRouter.get('/all', getStudents)
studentRouter.get('/student/:id', getStudent)
studentRouter.get('/self', studentAuth, getSelf)

studentRouter.post('/cor', parseCOR)
studentRouter.put('/pfp/:id', uploadSingleImage, processImage, updatePfp)
studentRouter.put('/password/:id', updatePassword)

studentRouter.put('/admin/update-pfp/:id', adminAuth, uploadSingleImage, processImage, updatePfpByAdmin)
studentRouter.put('/admin/update-password/:id', adminAuth, updatePasswordByAdmin)

export default studentRouter;