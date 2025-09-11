const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const brandsController = require("../../controller/brands.controller");

const {verifyJWT} = require("../../middleware/authMiddleware");

router.route("/list").get(brandsController.brandsList);
router.route("/details/:id").get(verifyJWT,brandsController.brandsDetails);
router.route("/add").post(uploadBuffer.any(),verifyJWT,brandsController.brandsAdd);
router.route("/edit/:id").put(verifyJWT, brandsController.brandsEdit);
router.route("/status-change/:id").patch(verifyJWT, brandsController.StatusChange);
router.route("/delete").patch( verifyJWT,brandsController.brandsDelete);

module.exports = router;