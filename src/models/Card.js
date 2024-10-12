import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const cardSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    displayImage: {
        type: String,
        required: true,
    },
    templateImage: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    material: {
        type: String,
        required: true,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    active: {
        type: Boolean,
        default: true,
    },
});

// Add the pagination plugin to the schema
cardSchema.plugin(mongoosePaginate);

const Card = model("Card", cardSchema);

export default Card;
