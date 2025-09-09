
const siteSettingsService = require("../services/siteSettings.services");

// User List Controller
const siteSettingsList = async (req, res) => {
  try {
    const result = await siteSettingsService.siteSettingList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const siteSettingsDetails = async (req, res) => {
  try {
    const result = await siteSettingsService.siteSettingDetails({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const siteSettingsAdd = async (req, res) => {
  try {
     const logo= req.files;
    const result = await siteSettingsService.siteSettingAdd({ ...req.body,logo });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const siteSettingsEdit = async (req, res) => {
  try {
    const result = await siteSettingsService.siteSettingEdit({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const StatusChange = async (req, res) => {
  try {

    const result = await siteSettingsService.StatusChange({ ...req.params });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const siteSettingsDelete = async (req, res) => {
  try {
    const result = await siteSettingsService.siteSettingRemoves({ ...req.body});
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};




module.exports = { siteSettingsList, siteSettingsDetails,siteSettingsAdd,siteSettingsEdit,siteSettingsDelete,StatusChange };
