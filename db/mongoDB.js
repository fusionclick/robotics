const mongoose = require("mongoose");

const DATABASE_URL = process.env.DATABASE_URL; 
const LOCAL_DATABASE_URL = process.env.LOCAL_DATABASE_URL; 
const connectDB = () => {
  const dbUrl =
    process.env.NODE_ENV === "production" ? DATABASE_URL : LOCAL_DATABASE_URL;

  try {
    mongoose.set("runValidators", true);

    mongoose.connection.on("connected", () => {
      console.log(`MongoDB Connected in ${process.env.NODE_ENV} mode`);
    });

    mongoose.connection.on("error", (error) => {
      console.error(`MongoDB connection error: ${error.message}`);
    });

    return mongoose.connect(dbUrl);
  } catch (error) {
    console.error(`Connection error: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;
