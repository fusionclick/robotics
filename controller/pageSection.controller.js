
const pageSection = require("../services/pageSection.services");

// User List Controller
const pageSectionList = async (req, res) => {
  try {
    const result = await pageSection.pageSectionList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("pageSectionList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const pageSectionDetails = async (req, res) => {
  try {
    const result = await pageSection.pageSectionDetails({ ...req.params, });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("pageSectionDetails Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const pageSectionAdd = async (req, res) => {
  try {
    const image=req.files;
    const result = await pageSection.pageSectionAdd({ ...req.body,image});
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("pageSectionAdd Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const pageSectionEdit = async (req, res) => {
  try {
    const result = await pageSection.pageSectionEdit({ ...req.params,...req.body });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("pageSectionEdit Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const StatusChange = async (req, res) => {
  try {

    const result = await pageSection.StatusChange({ ...req.params });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("FaqStatus Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const pageSectionDelete = async (req, res) => {
  try {
    const result = await pageSection.pageSectionRemoves({ ...req.body});
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("pageSectionDelete Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};




module.exports = { pageSectionList, pageSectionDetails,pageSectionAdd,pageSectionEdit,pageSectionDelete,StatusChange };
