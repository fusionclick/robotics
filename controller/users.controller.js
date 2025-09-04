
const UserService = require("../services/users.services");

// User List Controller
const UserList = async (req, res) => {
  try {;
    const result = await UserService.userList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const UserDetails = async (req, res) => {
  try {;
    const result = await UserService.userList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const UserAdd = async (req, res) => {
  try {;
    const result = await UserService.userList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const UserEdit = async (req, res) => {
  try {;
    const result = await UserService.userList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const UserDelete = async (req, res) => {
  try {;
    const result = await UserService.userRemoves({ ...req.body});
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

// User Detalis Controller


module.exports = { UserList, UserDetails,UserAdd,UserEdit,UserDelete };
