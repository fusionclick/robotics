const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const siteSettingsController = require("../../controller/siteSettings.controller");

const {verifyJWT} = require("../../middleware/authMiddleware");

router.route("/").get(siteSettingsController.siteSettingsList);
router.route("/details/:id").get(siteSettingsController.siteSettingsDetails);
// router.route("/add").post(uploadBuffer.any(),verifyJWT,siteSettingsController.siteSettingsAdd);
router.route("/edit/:id").put(uploadBuffer.any(),verifyJWT, siteSettingsController.siteSettingsEdit);
router.route("/status-change/:id").patch(verifyJWT, siteSettingsController.StatusChange);
// router.route("/delete").patch( verifyJWT,siteSettingsController.siteSettingsDelete);

module.exports = router;