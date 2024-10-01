import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const visitorQRSchema = new Schema({
    cardNumber: {
        type: String,
        required: true,
    },
}); 

visitorQRSchema.plugin(mongoosePaginate);

const VisitorQR = model("VisitorQR", visitorQRSchema);

export default VisitorQR;