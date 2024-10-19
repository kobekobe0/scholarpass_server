import ViolationLog from "../../models/ViolationLog.js";

export const getViolations = async (req, res) => {
    const { studentName, severity, startDate, endDate, page = 1, limit = 100 } = req.query;

    try {
        let query = {};

        // Filter by severity if provided
        if (severity) {
            query.severity = severity;
        }

        // Date range filtering if provided
        if (startDate && endDate) {
            query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.createdAt = { $lte: new Date(endDate) };
        }

        // Dynamic filtering by studentName (single string) using populate
        let violationsQuery = ViolationLog.find(query)
            .populate({
                path: 'studentID',
                select: 'name studentNumber _id',
                match: studentName
                    ? { 'name': { $regex: new RegExp(studentName, 'i') } } // Case-insensitive search by full studentName
                    : {} // If no studentName, don't apply match filter
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit) // Pagination: skip documents for previous pages
            .limit(parseInt(limit));  // Limit the number of documents

        const violations = await violationsQuery.exec();

        // Filter out violations where studentID is null due to no match on studentName
        const filteredViolations = violations.filter(v => v.studentID !== null);

        // Get the total count for pagination metadata (without filtering for studentID)
        const totalViolations = await ViolationLog.countDocuments(query);

        // Response with paginated results and total count
        res.status(200).json({
            total: totalViolations,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalViolations / limit),
            data: filteredViolations
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching violations", error: error.message });
    }
};



export const getStudentViolations = async (req, res) => {
    const { id } = req.params;

    try {
        console.log(id)
        const violations = await ViolationLog.find({ studentID: id }).sort({ createdAt: -1 });
        res.status(200).json(violations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching violations", error: error.message });
    }
}