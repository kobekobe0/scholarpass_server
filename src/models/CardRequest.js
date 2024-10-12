import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const cardRequestSchema = new Schema({
    studentID: {
        type: String,
        required: true,
        ref: 'Student'
    },
    vehicleID: {
        type: String,
        ref: 'Vehicle',
        default: null
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
        enum: ['Pending', 'Approved', 'Rejected']
    },
    cardID: {
        type: String,
        ref: 'Card',
        required: true
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    refNumber: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}); 

cardRequestSchema.plugin(mongoosePaginate);

const CardRequest = model("CardRequest", cardRequestSchema);

export default CardRequest;