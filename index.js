require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const http = require("http");
const cron = require("node-cron");
const connectDB = require("./db/mongoDB");
const apiRoute = require("./routes/api.v1.route");
const PORT = process.env.PORT || 4000;
async function start() {
  app.use(cors());
  app.use("/public", express.static("public"));
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "defaultsecret",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }, // Set to true if using HTTPS
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/v1", apiRoute);

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  await connectDB();
}

start();

// app.post("/game/:ip/:port/delete", async (req, res) => {
//   try {
//     const response = await axios.post(`http://${req.params.ip}:${req.params.port}/delete`, {});

//     res.status(200).json({
//       message: "All documents deleted successfully",
//       data: response.data // Optional: include response from the remote server
//     });

//     console.log("Deletion request sent to target server.");
//   } catch (e) {
//     console.error("Error deleting documents:", e.message);

//     res.status(500).json({
//       message: "Failed to delete documents",
//       error: e.message
//     });
//   }
// });


// import axios from "axios"
// const beforeModeCall = async () => {
//   try {
//     const response = await axios.get(
//       "https://smart.smartwingamez.net/api/winning-hotlist?game_name=jeetoJokerprint"
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching data: ", error);
//     throw error;
//   }
// };
// const beforeStart = await beforeModeCall();
// console.log(beforeStart.list[0]?.win_type);
