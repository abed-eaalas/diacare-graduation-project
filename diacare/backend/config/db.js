const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 0);

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not set');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // fail fast if cannot reach MongoDB
            connectTimeoutMS: 5000,
            bufferCommands: false,
            bufferTimeoutMS: 0,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        // Do not exit process; return false so server can still start for testing
        return false;
    }
};

const isDbConnected = () => mongoose.connection.readyState === 1;

module.exports = {
    connectDB,
    isDbConnected,
};