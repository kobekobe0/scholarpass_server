import Card from "../../models/Card.js";

export const getAvailableCards = async (req, res) => {
    try {
        const cards = await Card.find({ active: true, deleted: false }).select('name displayImage price material');
        return res.status(200).json(cards);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to get cards' });
    }
};

export const getAllCards = async (req, res) => {
    try {
        const cards = await Card.find();
        return res.status(200).json(cards);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to get cards' });
    }
}
