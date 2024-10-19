import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const violationLogSchema = new Schema({
    studentID: {
        type: String,
        ref: 'Student'
    },
    violation:{
        type: String,
        required: true,
    },
    severity: {
        type: String,
        enum: ["MINOR", "MAJOR", "SEVERE"],
        required: true
    },
    current: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}); 

violationLogSchema.plugin(mongoosePaginate);

const ViolationLog = model("ViolationLog", violationLogSchema);

export default ViolationLog;