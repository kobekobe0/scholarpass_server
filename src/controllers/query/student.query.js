import Student from "../../models/Student.js";
import paginate from '../../helper/paginate.js'
import bcrypt from 'bcryptjs';
import generateAuthToken from "../../helper/generateAuthToken.js";
import jwt from 'jsonwebtoken';

export const getStudents = async (req, res) => {
    const { page, limit, department, search } = req.query;

    const query = {
        deleted: false,
        ...(department && { department })
    };

    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 100,
        sort: { "name.last": 1 }, 
        select: '-deleted'        
    };

    try {
        const students = await paginate(Student, query, options, search);
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: "Error fetching students", error: error.message });
    }
};

export const getStudent = async (req, res) => {
    const { id } = req.params;

    try {
        const student = await Student.findById(id).select('name _id schedul email cellphone studentNumber department');
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: "Error fetching student", error: error.message });
    }
}

export const loginStudent = async (req, res) => {
    const { studentNumber, password } = req.body;

    try {
        const student = await Student.findOne({ studentNumber });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        // Check if password is correct
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = await generateAuthToken(student, "Student")

        res.status(200).json({ message: "Login successful", token: token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in student", error: error.message });
    }
}

export const verifyJWT = async (req, res) => {
    const {token} = req.body;
    try {
        console.log(token, process.env.SECRET_KEY)
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log(decoded)
        req.user = decoded;
        const user = await Student.findById(decoded._id)
        const userWithImage = {
            ...user._doc,
            image: user.pfp
        }
        res.status(200).json({ message: "Token is valid", success: true, user: userWithImage });
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: "Unauthorized", success: false });
    }
}

export const getSelf = async (req, res) => {
    const { _id } = req.user;
    try {
        const student = await Student.findById(_id).select('name _id schedule email cellphone studentNumber department');
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: "Error fetching student", error: error.message });
    }
}