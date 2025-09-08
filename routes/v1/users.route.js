const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const UserController = require("../../controller/users.controller");

const {verifyJWT} = require("../../middleware/authMiddleware");

router.route("/list").get(verifyJWT,UserController.UserList);
router.route("/details/:id").get(verifyJWT,UserController.UserDetails);
router.route("/add").post(uploadBuffer.any(),verifyJWT,UserController.UserAdd);
router.route("/edit/:id").put(verifyJWT, UserController.UserEdit);
router.route("/delete").patch( verifyJWT,UserController.UserDelete);




module.exports = router;