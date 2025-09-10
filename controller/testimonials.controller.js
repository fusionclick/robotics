
const TestimonialService = require("../services/testimonials.service");

// User List Controller
const testimonialList = async (req, res) => {
  try {
    const result = await TestimonialService.testimonialList({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("FaqList Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const testimonialDetails = async (req, res) => {
  try {
    const result = await TestimonialService.testimonialDetails({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("FaqDetails Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const testimonialAdd = async (req, res) => {
  try {
    const result = await TestimonialService.testimonialAdd({ ...req.body });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("FaqAdd Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const testimonialEdit = async (req, res) => {
  try {
    const result = await TestimonialService.testimonialEdit({ ...req.params,...req.query });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("FaqEdit Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const StatusChange = async (req, res) => {
  try {

    const result = await TestimonialService.StatusChange({ ...req.params });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("FaqStatus Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const testimonialDelete = async (req, res) => {
  try {
    const result = await TestimonialService.testimonialRemoves({ ...req.body});
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("FaqDelete Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};




module.exports = { testimonialList, testimonialDetails,testimonialAdd,testimonialEdit,testimonialDelete,StatusChange };
