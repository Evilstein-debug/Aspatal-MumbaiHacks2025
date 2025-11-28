import express from "express";
import 'dotenv/config';
import cors from "cors";
import connectDB from "./config/db.js";

const port = process.env.PORT || 8000
const allowedOrigins = process.env.CORS_ORIGIN

const app = express()

app.use(cors({
    origin: allowedOrigins,
}))

app.use(express.json())

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("Error in express application: ", error)
    })
    app.listen(port, () => {
        console.log("app listening on port: ", port)
        console.log(`origin: ${process.env.CORS_ORIGIN}`)
    })
    
})
.catch((error) => {
    console.log("\nMongoDB connection error!", error)
})