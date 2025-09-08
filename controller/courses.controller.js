
const CoursesService = require("../services/courses.services");

// User List Controller
const CourseList = async (req, res) => {
  try {
    const result = await CoursesService.courseList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("CourseList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const CourseDetails = async (req, res) => {
  try {
    const result = await CoursesService.courseList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("CourseDetails Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const CourseAdd = async (req, res) => {
  try {
   const image= req.files;
    const result = await CoursesService.courseAdd({ ...req.body,image });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("CourseAdd Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const CourseEdit = async (req, res) => {
  try {
    const result = await CoursesService.courseList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const StatusChange = async (req, res) => {
  try {

    const result = await CoursesService.StatusChange({ ...req.params });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const CourseDelete = async (req, res) => {
  try {
    const result = await CoursesService.courseRemoves({ ...req.body});
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("UserList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};




module.exports = { CourseList, CourseDetails,CourseAdd,CourseEdit,CourseDelete,StatusChange };
