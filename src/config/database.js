import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 20000, // Timeout after 20 seconds
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        // Optionally, you could implement retry logic here
    }
};

mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
});

export default connectToMongoDB;
