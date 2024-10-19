import { Schema, model } from "mongoose";
const nameSchema = new Schema({
    first: {
        type: String,
        required: true,
    },
    last: {
        type: String,
        required: true,
    },
    middle: {
        type: String,
    },
    suffix: {
        type: String,
    },
})

const SecurityGuardSchema = new Schema({
    name : {
        type: nameSchema,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    deleted: {
        type: Boolean,
        default: false,
    }
}); 

const SecurityGuard = model("SecurityGuard", SecurityGuardSchema);

export default SecurityGuard;