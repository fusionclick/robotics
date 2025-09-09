const express = require("express");
const router = express.Router();

router.use("/auth", require("./v1/auth.route"));
// router.use("/dashboad",require("../routes/v1/dashboard.route"))
router.use("/users", require("../routes/v1/users.route"));
router.use("/roles", require("../routes/v1/roles.route"));
router.use("/courses", require("../routes/v1/courses.route"));
router.use("/pages", require("../routes/v1/pages.route"));
// router.use("/background",require("../routes/v1/background.route"))
router.use("/faqs", require("../routes/v1/faqs.route"));
router.use("/site-settings", require("../routes/v1/siteSettings.route"));
// router.use("/testimonials", require("../routes/v1/testimonials.route"));
module.exports = router;