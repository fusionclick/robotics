const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const AuthController = require("../../controller/auth.controller");
const {validateSignup,validateLogin}=require("../../validateField/validate")

router.route("/list").post(validateLogin,AuthController.login);
router.route("/details/:id").post(validateLogin,AuthController.login);
router.route("/add").post(uploadBuffer.any(), validateSignup,AuthController.signup);
router.route("/edit/:id").post( AuthController.refreshAccessToken);
router.route("/delete/:id").post( AuthController.refreshAccessToken);

module.exports = router;