
const brandsService = require("../services/brands.services");

// User List Controller
const brandsList = async (req, res) => {
  try {
    const result = await brandsService.brandsList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("brandsList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const brandsDetails = async (req, res) => {
  try {
    const result = await brandsService.brandsDetails({ ...req.params, });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("brandsDetails Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const brandsAdd = async (req, res) => {
  try {
    const image=req.files;
    const result = await brandsService.brandsAdd({ ...req.body,image });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("brandsAdd Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const brandsEdit = async (req, res) => {
  try {
    const result = await brandsService.brandsEdit({ ...req.params,...req.body });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("brandsEdit Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const StatusChange = async (req, res) => {
  try {

    const result = await brandsService.StatusChange({ ...req.params });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("brandsStatus Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const brandsDelete = async (req, res) => {
  try {
    const result = await brandsService.brandsRemoves({ ...req.body});
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("brandsDelete Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};




module.exports = { brandsList, brandsDetails,brandsAdd,brandsEdit,brandsDelete,StatusChange };
