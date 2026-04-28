const mongoose = require('mongoose');

/**
 * Connects Mongoose to MongoDB using the MONGO_URI environment variable.
 * The process exits on connection failure because the API cannot run safely
 * without a database connection.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }

    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
