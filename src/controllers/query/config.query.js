import Config from "../../models/Config.js";

export const getConfig = async (req, res) => {
    try {
        const config = await Config.findOne();
        if(!config) return res.status(404).json({ message: 'Config not found' });
        return res.status(200).json(config);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch config' });
    }
}