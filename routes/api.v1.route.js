const express = require("express");
const router = express.Router();

router.use("/auth", require("./v1/auth.route"));
// router.use("/dashboad",require("../routes/v1/dashboard.route"))
router.use("/users", require("../routes/v1/users.route"));
router.use("/roles", require("../routes/v1/roles.route"));
module.exports = router;