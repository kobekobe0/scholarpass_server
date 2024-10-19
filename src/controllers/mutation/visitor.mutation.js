import VisitorLog from "../../models/VisitorLog.js";
import VisitorQR from "../../models/VisitorQR.js"

export const createQR = async (req, res) => {
    const {number} = req.body
    try {
        // create multiple new qr depending on the number length
        if(number < 1) {
            return res.status(400).json({ message: 'Number must be greater than 0' });
        }
        const visitorCardCount = await VisitorQR.countDocuments();
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const day = new Date().getDate();
        const date = `${year}${month}${day}`;

        for (let i = 0; i < number; i++) {
            await VisitorQR.create({
                cardNumber: date + (visitorCardCount + 1 + i).toString(),
            });
        }

        return res.status(200).json({ message: 'Visitor QR created successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create visitor QR', error: error.message });
    }
}

export const deleteQR = async (req, res) => {
    const { ids } = req.body;

    try {
        for (let id of ids) {
            await VisitorQR.findByIdAndDelete(id);
        }

        return res.status(200).json({ message: 'Visitor QR deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete visitor QR', error: error.message });
    }
}

export const toggleQR = async (req, res) => {
    const {id} = req.params

    try {
        const visitorQR = await VisitorQR.findById(id);
        if (!visitorQR) {
            return res.status(404).json({ message: 'Visitor QR not found' });
        }

        visitorQR.valid = !visitorQR.valid;
        await visitorQR.save();

        return res.status(200).json({ message: 'Visitor QR updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update visitor QR', error: error.message });
    }
}

export const logVisitor = async (req, res) => {
    const {visitor, cardID} = req.body

    try {
        const visitorQR = await VisitorQR.findById(cardID)
        if(!visitorQR) return res.status(404).json({message: 'VisitorQR not found'})
        if(!visitorQR.valid) return res.status(400).json({message: 'VisitorQR is invalid'})
        
        if(visitorQR.inUse) {
            return res.status(400).json({message: 'VisitorQR is in use'})
        }

        visitorQR.inUse = true
        await visitorQR.save()

        const visitorLog = await VisitorLog.create({
            name: visitor.name,
            agency: visitor.agency,
            address: visitor.address,
            personToVisit: visitor.personToVisit,
            number: visitor.number,
            purpose: visitor.purpose,
            visitorCardID: cardID
        })

        return res.status(200).json({
            message: 'Visitor Log created',
            status: "IN",
            visitorLog
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({error, message: 'logVisitor'})
    }

}