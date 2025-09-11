const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const enrollmentController = require("../../controller/enrollment.controller");

const {verifyJWT} = require("../../middleware/authMiddleware");

router.route("/list").get(verifyJWT,enrollmentController.enrollmentList);
router.route("/details/:id").get(verifyJWT,enrollmentController.enrollmentDetails);
router.route("/add").post(verifyJWT,enrollmentController.enrollmentAdd);
router.route("/add/public").post(enrollmentController.enrollmentAdd);
router.route("/edit/:id").put(verifyJWT, enrollmentController.enrollmentEdit);
router.route("/status-change/:id").patch(verifyJWT, enrollmentController.StatusChange);
// router.route("/delete").patch( verifyJWT,enrollmentController.RoleDelete);

module.exports = router;