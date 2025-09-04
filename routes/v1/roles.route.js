const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const RoleController = require("../../controller/roles.controller");

const {verifyJWT} = require("../../middleware/authMiddleware");

router.route("/list").get(verifyJWT,RoleController.RoleList);
// router.route("/details/:id").get(verifyJWT,RoleController.RoleDetails);
// router.route("/add").post(verifyJWT,RoleController.RoleAdd);
// router.route("/edit/:id").put(verifyJWT, RoleController.RoleEdit);
router.route("/status-change/:id").patch(verifyJWT, RoleController.StatusChange);
// router.route("/delete").patch( verifyJWT,RoleController.RoleDelete);

module.exports = router;