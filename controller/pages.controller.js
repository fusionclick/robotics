
const PageService = require("../services/pages.services");

// User List Controller
const PageList = async (req, res) => {
  try {
    const result = await PageService.PageList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const PagePublic = async (req, res) => {
  try {
    const result = await PageService.PagePublic({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const PageDetails = async (req, res) => {
  try {;
    const result = await PageService.PageList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const PageAdd = async (req, res) => {
  try {
    const result = await PageService.PageAdd({ ...req.body });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const PageEdit = async (req, res) => {
  try {
    const result = await PageService.PageList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const StatusChange = async (req, res) => {
  try {
    const result = await PageService.StatusChange({ ...req.params });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const PageDelete = async (req, res) => {
  try {
    const result = await PageService.PageRemoves({ ...req.body});
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};




module.exports = { PageList, PageDetails,PageAdd,PageEdit,PageDelete,StatusChange };
