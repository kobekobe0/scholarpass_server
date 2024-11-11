import Student from "../../models/Student.js";
import { createSystemLog } from "../../middleware/createSystemLog.js";
import Vehicle from "../../models/Vehicle.js";

export const createVehicle = async (req, res) => {
    const {_id} = req.user;
    const { plateNumber, model, color, type } = req.body;
    const img = `${req.filename}`;

    if(!img) return res.status(400).json({ message: "Image is required" });
    try {
        const newVehicle = await Vehicle.create({
            plateNumber,
            model,
            color,
            type,
            studentID: _id,
            image: img
        });
        if (newVehicle) {
            await createSystemLog("CREATE", "VEHICLE", newVehicle._id, "Student", `Vehicle with ${newVehicle.plateNumber} plate number created`, null);
            return res.status(201).json(newVehicle);
        }
        return res.status(400).json({ message: "Failed to create vehicle" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to create vehicle", error: error.message });
    }
}

export const updateVehicle = async (req, res) => {
    const { id } = req.params;
    const { plateNumber, model, color, type } = req.body;

    try {
        const updatedVehicle = await Vehicle.findByIdAndUpdate(id, {
            plateNumber,
            model,
            color,
            type
        }, { new: true });
        if (updatedVehicle) {
            await createSystemLog("UPDATE", "VEHICLE", updatedVehicle._id, "Vehicle", `Vehicle ${updatedVehicle.plateNumber} updated`, null);
            return res.status(200).json(updatedVehicle);
        }
        return res.status(404).json({ message: "Vehicle not found" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update vehicle", error: error.message });
    }
}
export const updateVehicleImage = async (req, res) => {
    const { id } = req.params;
    const image = `${req.filename}`;

    try {
        const updatedVehicle = await Vehicle.findByIdAndUpdate(id, {
            image
        }, { new: true });
        if (updatedVehicle) {
            await createSystemLog("UPDATE", "VEHICLE", updatedVehicle._id, "Vehicle", `Vehicle ${updatedVehicle.plateNumber} image updated`, null);
            return res.status(200).json(updatedVehicle);
        }
        return res.status(404).json({ message: "Vehicle not found" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update vehicle", error: error.message });
    }
}

export const deleteVehicle = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedVehicle = await Vehicle.findByIdAndUpdate(id, { deleted: true }, { new: true });
        if (deletedVehicle) {
            await createSystemLog("DELETE", "VEHICLE", deletedVehicle._id, "Vehicle", `Vehicle ${deletedVehicle.plateNumber} deleted`, null);
            return res.status(200).json(deletedVehicle);
        }
        return res.status(404).json({ message: "Vehicle not found" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete vehicle", error: error.message });
    }
}