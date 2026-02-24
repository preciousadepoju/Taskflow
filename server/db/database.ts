import mongoose from 'mongoose';

export async function connectDB() {
    // Read URI here (at call-time), not at import-time — dotenv must run first
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
}

export default mongoose;
