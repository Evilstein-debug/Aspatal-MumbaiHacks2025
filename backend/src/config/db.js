import mongoose from "mongoose";
import 'dotenv/config';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/pathfinder`)
              console.log(`\nMongoDB connected succesfully! DB Host: ${connectionInstance.connection.host}`)
    }
    catch(error) {
        console.log("MongoBD connection error: ", error)
        process.exit(1)
    }
}

export default connectDB