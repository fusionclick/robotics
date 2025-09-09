const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const coursesController = require("../../controller/background.controller");

const {verifyJWT} = require("../../middleware/authMiddleware");

// router.route("/list").get(verifyJWT,coursesController.CourseList);
// router.route("/delete").patch( verifyJWT,coursesController.CourseDelete);
router.route("/details/:id").get(verifyJWT,coursesController.CourseDetails);
router.route("/add").post(uploadBuffer.any(),verifyJWT,coursesController.CourseAdd);
router.route("/edit/:id").put(uploadBuffer.any(),verifyJWT, coursesController.CourseEdit);
router.route("/status-change/:id").patch(verifyJWT, coursesController.StatusChange);

module.exports = router;