import express from "express";
import { createVehicle, deleteVehicle, updateVehicle, updateVehicleImage } from "../controllers/mutation/vehicle.mutation.js";
import { studentAuth } from "../middleware/studentAuth.js";
import { getStudentVehicles, getVehicle, getVehicles } from "../controllers/query/vehicle.query.js";
import { uploadSingleImage, processImage } from "../middleware/uploadVehicle.js";
const vehicleRouter = express.Router();

vehicleRouter.post('/create', studentAuth, uploadSingleImage, processImage, createVehicle);
vehicleRouter.put('/update/:id', studentAuth, updateVehicle);
vehicleRouter.put('/update-image/:id', studentAuth, uploadSingleImage, processImage, updateVehicleImage);
vehicleRouter.delete('/delete/:id', studentAuth, deleteVehicle);

vehicleRouter.get("/all", getVehicles);
vehicleRouter.get("/vehicle/:id", getVehicle);
vehicleRouter.get("/student/:id", getStudentVehicles);


export default vehicleRouter;