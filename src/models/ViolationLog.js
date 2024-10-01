import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const violationLogSchema = new Schema({
    studentID: {
        type: String,
        ref: 'Student'
    },
    violation: [{
        type: String,
        required: true,
    }],
}); 

violationLogSchema.plugin(mongoosePaginate);

const ViolationLog = model("ViolationLog", violationLogSchema);

export default ViolationLog;