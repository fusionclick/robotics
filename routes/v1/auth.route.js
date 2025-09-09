const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const AuthController = require("../../controller/auth.controller");
const {validateSignup,validateLogin}=require("../../validateField/validate")
const {verifyJWT} = require("../../middleware/authMiddleware");
router.route("/login").post(validateLogin,AuthController.login);
router.route("/admin/login").post(validateLogin,AuthController.adminLogin);
router.route("/signup").post(uploadBuffer.any(), validateSignup,AuthController.signup);
router.route("/refresh-Access-Token").post( AuthController.refreshAccessToken);
router.route("/profile").get(verifyJWT, AuthController.profile);

module.exports = router;