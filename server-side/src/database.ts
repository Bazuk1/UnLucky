import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
	try {
		await mongoose.connect(process.env.MONGO_URL || "");
		console.log("Connection to the database is established!");
	} catch (err) {
		console.error(err);
	}
}

connectDB();
