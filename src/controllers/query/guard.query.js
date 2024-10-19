import SecurityGuard from '../../models/SecurityGuard.js';

export const getSecurityGuards = async (req, res) => {
    try{
        const guards = await SecurityGuard.find({deleted: false}).select('-password -__v -deleted');
        return res.status(200).json(guards);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error, message: 'Failed to fetch security guards'});
    }
}

export const getSecurityGuard = async (req, res) => {
    const {id} = req.params;
    try {
        const guard = await SecurityGuard.findById(id).select('-password -__v -deleted');
        if(!guard) return res.status(404).json({message: 'Security guard not found'});
        return res.status(200).json(guard);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error, message: 'Failed to fetch security guard'});
    }
}