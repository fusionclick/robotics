const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const pageSectionController = require("../../controller/pageSection.controller");

const {verifyJWT} = require("../../middleware/authMiddleware");

router.route("/list").get(pageSectionController.pageSectionList);
router.route("/details/:id").get(verifyJWT,pageSectionController.pageSectionDetails);
router.route("/add").post(uploadBuffer.any(),verifyJWT,pageSectionController.pageSectionAdd);
router.route("/edit/:id").put(verifyJWT, pageSectionController.pageSectionEdit);
router.route("/status-change/:id").patch(verifyJWT, pageSectionController.StatusChange);
// router.route("/delete").patch( verifyJWT,pageSectionController.RoleDelete);

module.exports = router;