import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const visitorLogSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    timeIn : {
        type: Date,
        required: true,
        default: Date.now
    },
    timeOut : {
        type: Date,
        default: null
    },
    agency: {
        type: String
    },
    address: {
        type: String
    },
    personToVisit: {
        type: String
    },
    number: {
        type: String
    },
    purpose: {
        type: String,
        required: true,
    },
    visitorCardID: {
        type: String,
        required: true,
    },
    guard: {
        type: String,
        required: null,
    }
}); 

visitorLogSchema.plugin(mongoosePaginate);

const VisitorLog = model("VisitorLog", visitorLogSchema);

export default VisitorLog;