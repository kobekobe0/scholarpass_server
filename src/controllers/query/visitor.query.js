import VisitorLog from "../../models/VisitorLog.js";
import VisitorQR from "../../models/VisitorQR.js";

export const getVisitorQRs = async (req, res) => {
    const {valid, inUse} = req.query

    try{
        let query = {}
        if(valid) query.valid = valid
        if(inUse) query.inUse = inUse

        console.log(query)
        const visitorQRs = await VisitorQR.find(query)
        return res.status(200).json(visitorQRs)
    } catch (error) {
        console.log(error)
        return res.status(500).json({error, message: 'getVisitorQRs'})
    }
}


export const getVisitorQR = async (req, res) => {
    const {id}  = req.params

    try{
        const visitorQR = await VisitorQR.findById(id)
        if(!visitorQR) return res.status(404).json({message: 'VisitorQR not found'})
        if(!visitorQR.valid) return res.status(400).json({message: 'VisitorQR is invalid'})
        
        if(visitorQR.inUse) {
            const visitorLog = await VisitorLog.findOne({visitorCardID: id, timeOut: null}).sort({timeIn: -1})
            if(!visitorLog) {
                visitorQR.inUse = false
                await visitorQR.save()
                return res.status(400).json({message: 'VisitorQR is in use but no visitorLog found'})
            }
            visitorQR.inUse = false
            visitorLog.timeOut = Date.now()
            await visitorQR.save()
            await visitorLog.save()

            return res.status(200).json({
                message: 'Visitor Log updated',
                status: "OUT",
                visitorLog
            })
        }

        return res.status(200).json({
            message: 'VisitorQR is not in use',
            status: "IN",
            visitorQR
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({error, message: 'getVisitorQR'})
    }
}

export const getVisitorLogs = async (req, res) => {
    const { name, fromDate, toDate, page = 1, limit = 100, visitorCardID = null } = req.query;

    try {
        let query = {};

        if (visitorCardID) {
            query.visitorCardID = visitorCardID;
        }


        if (fromDate && toDate) {
            query.timeIn = { $gte: new Date(fromDate), $lte: new Date(toDate) };
        } else if (fromDate) {
            query.timeIn = { $gte: new Date(fromDate) };
        } else if (toDate) {
            query.timeIn = { $lte: new Date(toDate) };
        }

        if(name) {
            query.name = { $regex: new RegExp(name, 'i') }
        }

        const visitorLogs = await VisitorLog.find(query)
            .sort({ timeIn: -1 })
            .skip((page - 1) * limit) 
            .limit(parseInt(limit))
            .populate('visitorCardID', 'cardNumber _id');  
        
        const totalVisitorLogs = await VisitorLog.countDocuments(query);
        
        return res.status(200).json({
            total: totalVisitorLogs,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalVisitorLogs / limit),
            data: visitorLogs
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to get visitor logs', error: error.message });
    }
}

export const getVisitorLogByCardID = async (req, res) => {
    const {id} = req.params

    try {
        const visitorLog = await VisitorLog.find(({
            visitorCardID: id
        })).select('-__v').sort({timeIn: -1}).limit(1)

        return res.status(200).json(visitorLog)

    } catch (error) {
        console.log(error)
        return res.status(500).json({error, message: 'getVisitorLogByCardID'})
    }
}