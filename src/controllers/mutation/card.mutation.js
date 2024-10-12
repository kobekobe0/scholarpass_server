import Card from "../../models/Card.js";

export const createCard = async (req, res) => {
    const card = req.body;
    const displayImage = `${req.filenames.displayImage}`;
    const templateImage = `${req.filenames.templateImage}`;

    try {
        //image and template image will come from multer
        const newCard = await Card.create({
            name: card.name,
            displayImage: displayImage,
            templateImage: templateImage,
            price: card.price,
            material: card.material
        });

        return res.status(201).json({ message: 'Card created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to create card' });
    }
}

export const updateCard = async (req, res) => {
    const { id } = req.params;
    const card = req.body;
    

    try {
        let displayImage = null
        let templateImage = null

        if(req.filename.displayImage) displayImage = `${req.filename.displayImage}`;
        if(req.filename.templateImage) templateImage = `${req.filename.templateImage}`;

        let updateBody = {
            name: card.name,
            price: card.price,
            material: card.material
        }

        if(displayImage) updateBody.displayImage = displayImage;
        if(templateImage) updateBody.templateImage = templateImage;

        const updatedCard = await Card
            .findByIdAndUpdate({
                _id: id
            }, updateBody, {
                new: true
            })
            .exec();
        
        if(!updatedCard) return res.status(400).json({ message: 'Failed to update card' });

        return res.status(200).json({ message: 'Card updated successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update card' });
    }
}

export const toggleCardActive = async (req, res) => {
    const { id } = req.params;

    try {
        const card = await Card.findById(id);
        if(!card) return res.status(400).json({ message: 'Card not found' });
        card.active = !card.active;
        await card.save();
        return res.status(200).json({ message: 'Card updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update card' });
    }
}

export const deleteCard = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCard = await Card.findByIdAndUpdate(id, { deleted: true }, { new: true });
        if(!deletedCard) return res.status(400).json({ message: 'Failed to delete card' });
        return res.status(200).json({ message: 'Card deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to delete card' });
    }
}