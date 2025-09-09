const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const FaqController = require("../../controller/faqs.controller");

const {verifyJWT} = require("../../middleware/authMiddleware");

router.route("/list").get(verifyJWT,FaqController.FaqList);
router.route("/details/:id").get(verifyJWT,FaqController.FaqDetails);
router.route("/add").post(verifyJWT,FaqController.FaqAdd);
router.route("/add/public").post(FaqController.FaqAdd);
router.route("/edit/:id").put(verifyJWT, FaqController.FaqEdit);
router.route("/status-change/:id").patch(verifyJWT, FaqController.StatusChange);
// router.route("/delete").patch( verifyJWT,FaqController.RoleDelete);

module.exports = router;