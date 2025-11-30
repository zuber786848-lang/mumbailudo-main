const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const dbUrl = process.env.DB;

if (!dbUrl) {
  console.error("Error: DB environment variable is not set.");
  process.exit(1); // Exit the process with a failure code
}

// MongoDB connection options
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connect to MongoDB
mongoose
  .connect(dbUrl, dbOptions)
  .then(() => {
    console.log("🍏🍏 Connected to MongoDB 🍏🍏");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Export the Mongoose instance to use in other parts of the application
module.exports = mongoose;
