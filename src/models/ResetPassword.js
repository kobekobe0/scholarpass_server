import { Schema, model } from "mongoose";

const resetPasswordSchema = new Schema({
    studentNumber: {
        type: String,
    },
    email: {
        type: String,
    },
    expires: {
        type: Date,
        required: true,
    },
    used: {
        type: Boolean,
        required: true,
        default: false,
    },
}); 

const ResetPassword = model("ResetPassword", resetPasswordSchema);

export default ResetPassword;