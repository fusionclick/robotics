
const RoleService = require("../services/roles.services");

// User List Controller
const RoleList = async (req, res) => {
  try {;
    const result = await RoleService.roleList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const RoleDetails = async (req, res) => {
  try {;
    const result = await RoleService.roleList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const RoleAdd = async (req, res) => {
  try {;
    const result = await RoleService.roleAdd({ ...req.body });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const RoleEdit = async (req, res) => {
  try {;
    const result = await RoleService.userList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const StatusChange = async (req, res) => {
  try {

    const result = await RoleService.StatusChange({ ...req.params });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const RoleDelete = async (req, res) => {
  try {;
    const result = await RoleService.userRemoves({ ...req.body});
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};




module.exports = { RoleList, RoleDetails,RoleAdd,RoleEdit,RoleDelete,StatusChange };
