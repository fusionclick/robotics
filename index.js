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
  app.use("/api/v1", apiRoute);
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  await connectDB();
}

start();
