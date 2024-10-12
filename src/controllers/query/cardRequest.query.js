import e from 'express';
import CardRequest from '../../models/CardRequest.js'

export const getStudentRequests = async (req, res) => {
    const { studentID } = req.params;

    try {
        const cardRequests = await CardRequest.find({ studentID }).populate('studentID', 'name studentNumber').populate('cardID').populate('vehicleID', 'model').sort
            ({ createdAt: -1 });
        return res.status(200).json(cardRequests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to get card requests' });
    }
}

export const getRequest = async (req, res) => {
    const { id } = req.params;

    try {
        const cardRequest = await CardRequest.findById(id).populate('studentID', 'name studentNumber').populate('cardID').populate('vehicleID', 'model');
        if (!cardRequest) {
            return res.status(404).json({ message: "Card request not found" });
        }
        return res.status(200).json(cardRequest);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to get card request' });
    }
}

export const getRequestsByStatus = async (req, res) => {
    const { status } = req.params;
    try {
        const cardRequests = await CardRequest.find({ status, deleted: false }).populate('studentID', 'name studentNumber').populate('cardID').populate('vehicleID', 'model');
        return res.status(200).json(cardRequests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to get card requests' });
    }
}