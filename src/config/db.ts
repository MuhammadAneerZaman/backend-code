import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async ()=> {
    try {

        mongoose.connection.on('connected', ()=>{
            console.log('Connected to MongoDB');
        })

        mongoose.connection.on('error', (error)=>{
            console.error("Database connection error:", error);
            process.exit(1);
        })

        await mongoose.connect(config.databaseUrl as string);

       

    } catch (error) {
        console.error("Failed to connect Database", error);
        process.exit(1);
    }
}

export default connectDB;