import Vehicle from "../../models/Vehicle.js";
import paginate from '../../helper/paginate.js'
import Student from "../../models/Student.js";

export const getVehicles = async (req, res) => {
    const { page, limit, search } = req.query;

    const query = {
        deleted: false,
    };

    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 100,
        sort: { "plateNumber": 1 },
        select: '-deleted'
    };

    try {
        const vehicles = await paginate(Vehicle, query, options, search);
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: "Error fetching vehicles", error: error.message });
    }
}

export const getVehicle = async (req, res) => {
    const { id } = req.params;

    try {
        const vehicle = await Vehicle.findOne({_id: id, deleted:false}).populate('studentID','name studentNumber cellphone email');
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: "Error fetching vehicle", error: error.message });
    }
}

export const getStudentVehicles = async (req, res) => {
    const { id } = req.params;

    try {
        const vehicles = await Vehicle.find({ studentID: id, deleted: false }).sort({ plateNumber: 1 });
        const vehiclesWithImages = vehicles.map(vehicle => ({
            ...vehicle._doc,
            image: process.env.SERVER_URL + '/' + vehicle.image.replace(/ /g, '%20'),
        }));
        res.status(200).json(vehicles);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching vehicles", error: error.message });
    }
}