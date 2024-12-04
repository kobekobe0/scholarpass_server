import { Schema, model } from "mongoose";

const SYSchema = new Schema({
    start: {
        type: Number,
        required: true
    },
    end: {
        type: Number,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
}, {id: false});

const ViolationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        required: true,
        enum: ["MINOR", "MAJOR", "SEVERE"]
    }
});

const cardDesign = new Schema({
    visitor: {
        type: String,
        ref: "Card",
        default: ''
    },
    student: {
        type: String,
        ref: "Card",
        default: ''
    },
    vehicle: {
        type: String,
        ref: "Card",
        default: ''
    },
})

const configSchema = new Schema({
    SY: {
        type: SYSchema,
        required: true
    },
    violationTypes: {
        type: [ViolationSchema],
        required: true
    }
}); 

const Config = model("Config", configSchema);

export default Config;