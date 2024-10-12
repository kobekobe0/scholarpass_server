import generateRefNumber from '../../helper/generateRefNumber.js';
import { createSystemLog } from '../../middleware/createSystemLog.js';
import CardRequest from '../../models/CardRequest.js';



export const createCardRequest = async (req, res) => {
    const { studentID, vehicleID, cardID } = req.body;

    try {
        let body = {
            studentID,
            refNumber: generateRefNumber(),
            cardID
        }
        if(vehicleID) body.vehicleID = vehicleID;
        const newCardRequest = await CardRequest.create(body);
        if(!newCardRequest) return res.status(400).json({ message: "Failed to create card request" });
        await createSystemLog("CREATE", "CARD REQUEST", newCardRequest._id, "Student", `Card request created`, null);
        return res.status(201).json(newCardRequest);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Failed to create card request", error: error.message });
    }
}

export const updateCardRequest = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedCardRequest = await CardRequest.findByIdAndUpdate(id, { status
            }, { new: true });

        if(!updatedCardRequest) return res.status(404).json({ message: "Card request not found" });

        return res.status(200).json(updatedCardRequest);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Failed to update card request", error: error.message });
    }
}

export const deleteCardRequest = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCardRequest = await CardRequest
            .findByIdAndUpdate(id, { deleted: true }, { new: true });

        if(!deletedCardRequest) return res.status(404).json({ message: "Card request not found" });

        return res.status(200).json(deletedCardRequest);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Failed to delete card request", error: error.message });
    }
}

export const cancelRequest = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedCardRequest = await CardRequest.findByIdAndUpdate(id, { status: 'Cancelled' }, { new: true });
        
        if(!updatedCardRequest) return res.status(404).json({ message: "Card request not found" });

        return res.status(200).json(updatedCardRequest);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Failed to cancel card request", error: error.message });
    }    
}