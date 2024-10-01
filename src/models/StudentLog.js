import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const studentLogSchema = new Schema({
    studentID : {
        type: String,
        ref: 'Student'
    },
    timeIn : {
        type: Date,
        required: true,
    },
    timeOut : {
        type: Date,
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
}); 

studentLogSchema.plugin(mongoosePaginate);

const StudentLog = model("StudentLog", studentLogSchema);

export default StudentLog;