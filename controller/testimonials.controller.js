
const FaqService = require("../services/faq.services");

// User List Controller
const FaqList = async (req, res) => {
  try {
    const result = await FaqService.faqList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("FaqList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const FaqDetails = async (req, res) => {
  try {
    const result = await FaqService.faqDetails({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("FaqDetails Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const FaqAdd = async (req, res) => {
  try {
    const result = await FaqService.faqAdd({ ...req.body });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("FaqAdd Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const FaqEdit = async (req, res) => {
  try {
    const result = await FaqService.faqEdit({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("FaqEdit Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const StatusChange = async (req, res) => {
  try {

    const result = await FaqService.StatusChange({ ...req.params });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("FaqStatus Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const FaqDelete = async (req, res) => {
  try {
    const result = await FaqService.faqRemoves({ ...req.body});
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("FaqDelete Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};




module.exports = { FaqList, FaqDetails,FaqAdd,FaqEdit,FaqDelete,StatusChange };
