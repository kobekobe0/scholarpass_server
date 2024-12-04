import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const studentLogSchema = new Schema({
    studentID : {
        type: String,
        ref: 'Student'
    },
    timeIn : {
        type: Date,
        default: null
    },
    timeOut : {
        type: Date,
        default: null
    },
    vehicle: {
        type: String,
        ref: 'Vehicle'
    },
    violationID: {
        type: String,
        ref: 'ViolationLog',
        default: null
    },
    logDate: {
        type: Date,
        default: Date.now
    },
    guard: {
        type: String,
        default: null
    }
}); 

studentLogSchema.plugin(mongoosePaginate);

const StudentLog = model("StudentLog", studentLogSchema);

export default StudentLog;