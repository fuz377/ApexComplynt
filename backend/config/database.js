import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


// Connect to MongoDB
const mongo_url = process.env.MONGODB_URI;
console.log('MONGO_URL:', mongo_url);


const connectDB = async () => {
  try {
    if (!mongo_url) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongo_url, {
    });
    console.log(`✅ MongoDB Connected: ${conn.connection}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  
    console.log('Waiting for configuration fixes...');
  }
};

export default connectDB;