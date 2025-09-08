const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const PageController = require("../../controller/pages.controller");

const {verifyJWT} = require("../../middleware/authMiddleware");

router.route("/list").get(verifyJWT,PageController.PageList);
router.route("/details/:id").get(verifyJWT,PageController.PageDetails);
router.route("/add").post(uploadBuffer.any(),verifyJWT,PageController.PageAdd);
router.route("/edit").put(verifyJWT, PageController.PageEdit);
router.route("/delete").patch( verifyJWT,PageController.PageDelete);




module.exports = router;