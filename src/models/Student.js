import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const SYSchema = new Schema({
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
}, {id: false});

const studentSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    cellphone: {
        type: String,
        required: true,
    },
    schedule: {
        type:[[String]],
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    studentNumber: {
        type: String,
        required: true,
        unique: true,
    },
    pfp: {
        type: String,
    },
    department: {
        type: String,
        required: true,
    },
    completeRegistration: {
        type: Boolean,
        required: true,
        default: false,
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false,
    },
    password: {
        type: String,
        required: true,
    },
    lastPfpUpdate: {
        type: Date,
        default: Date.now,
    },
    degree: {
        type: String,
        required: true,
    },
    section: {
        type: String,
        required: true,
    },
    yearLevel: {
        type: String,
        required: true,
    },
    SY: {
        type: SYSchema,
        required: true,
    }
});

// Add the pagination plugin to the schema
studentSchema.plugin(mongoosePaginate);

const Student = model("Student", studentSchema);

export default Student;
