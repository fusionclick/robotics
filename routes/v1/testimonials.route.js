const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const testimonialController = require("../../controller/testimonials.controller");

const {verifyJWT} = require("../../middleware/authMiddleware");

router.route("/list").get(verifyJWT,testimonialController.testimonialList);
// router.route("/details/:id").get(verifyJWT,testimonialController.RoleDetails);
router.route("/add").post(verifyJWT,testimonialController.testimonialAdd);
// router.route("/edit/:id").put(verifyJWT, testimonialController.RoleEdit);
router.route("/status-change/:id").patch(verifyJWT, testimonialController.StatusChange);
router.route("/delete").patch( verifyJWT,testimonialController.testimonialDelete);

module.exports = router;