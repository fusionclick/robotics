
const enrollmentService = require("../services/enrollment.services");

// User List Controller
const enrollmentList = async (req, res) => {
  try {
    const result = await enrollmentService.enrollmentList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("enrollmentList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const enrollmentDetails = async (req, res) => {
  try {
    const result = await enrollmentService.enrollmentDetails({ ...req.params, });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("enrollmentDetails Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const enrollmentAdd = async (req, res) => {
  try {
    const result = await enrollmentService.enrollmentAdd({ ...req.body });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("enrollmentAdd Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const enrollmentEdit = async (req, res) => {
  try {
    const result = await enrollmentService.enrollmentEdit({ ...req.params,...req.body });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("enrollmentEdit Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const StatusChange = async (req, res) => {
  try {

    const result = await enrollmentService.StatusChange({ ...req.params });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("enrollmentStatus Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const enrollmentDelete = async (req, res) => {
  try {
    const result = await enrollmentService.enrollmentRemoves({ ...req.body});
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("enrollmentDelete Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};




module.exports = { enrollmentList, enrollmentDetails,enrollmentAdd,enrollmentEdit,enrollmentDelete,StatusChange };
