const mongoose = require('mongoose');


const connectDB = async () => {
  try {
    // Remove the deprecated options
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}; 

module.exports = connectDB;
