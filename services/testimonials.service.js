const testimonialModel = require("../model/testimonial.model");
const slugify = require("slugify");
const { createResponse } = require("../utils/response");
const {
  convertFieldsToAggregateObject,
} = require("../helper/index");
const { statusSearch } = require("../helper/search");
const { deleteFile, uploadBinaryFile } = require("../utils/upload");
const { ObjectId } = require("mongoose").Types;
const {validateRequiredFields} =require("../validateField/validate")
exports.testimonialList = async (params) => {
  try {
    const {
      _id = "",
      status,
      keyword,
      offset = 0,
      limit = 10,
      searchValue = "",
      selectValue = "name,occupation,description,status,deletedAt",
      sortQuery = "-createdAt",
    } = params;

    const select = selectValue && selectValue.replaceAll(",", " ");
    let selectProjectParams = convertFieldsToAggregateObject(select, " ");

    let query = { deletedAt: null };
    let optionalQuery = { deleteAt: null };

    if (status) query.status = statusSearch(status);

    if (Array.isArray(_id) && _id.length > 0) {
      let ids = _id.map((el) => new ObjectId(el));
      query["_id"] = { $in: ids };
    } else if (_id) query["_id"] = new ObjectId(_id);

    if (keyword) {
      const searchQuery = searchValue
        ? searchValue.split(",")
        : select.split(" ");
      optionalQuery.$or = search(searchQuery, keyword);
      if (keyword.includes(" ")) {
        optionalQuery.$or.push({
          $and: [{ name: { $regex: keyword.split(" ")[0], $options: "i" } }],
        });
      }
    }

    const myAggregate = testimonialModel.aggregate([
      { $match: query },
      {
        $project: {
          ...selectProjectParams,
        },
      },
      { $match: optionalQuery },
    ]);

    const result = await testimonialModel.aggregatePaginate(myAggregate, {
      offset: offset,
      limit: limit,
      sort: sortQuery,
    });

    return createResponse({
      status: 200,
      success: true,
      message: "Testimonial list fetched successfully",
      data: {
        list: result?.docs || [],
      },
    });
  } catch (error) {
    console.error("Role Error:", error);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${error.message}`,
    });
  }
};
exports.testimonialDetails = async (params) => {
    try {
      let query = { daletedAt: null };
      if (params.id) query["_id"] = params.id;
  
      const result = await this.courseList(query);
      return createResponse({
        status: 200,
        success: true,
        message: "Testimonial Details fetched successfully",
        data:  result?.data.list[0] || {}, 
      });
    } catch (error) {
      console.error("Role Error:", error);
      return createResponse({
        status: 500,
        success: false,
        message: `Server Error: ${error.message}`,
      });
    }
};


exports.testimonialAdd = async (params) => {
  try {
    const requiredFields = [
      "name",
      "occupation",
      "description",
    ];
    const validationError = validateRequiredFields(params, requiredFields);

    if (validationError) {
      return createResponse(validationError);
    }

    // Check for existing role by slug

    const testimonialData = new testimonialModel({
      ...params,
      createdBy: params.authUser ? params.authUser._id : null,
    });

    const savedTestimonialData = await testimonialData.save();

    return createResponse({
      status: 201,
      success: true,
      message: "Course created successfully",
      data: savedTestimonialData,
    });
  } catch (err) {
    console.error("Testimonial Add Error:", err.message);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

exports.testimonialEdit = async (params) => {
  try {
    if (!params.id) {
      return createResponse({
        status: 400,
        success: false,
        message: "Course ID not provided",
      });
    }

    const existingCourse = await CourseModel.findOne({
      _id: params.id,
      deleteAt: null,
    });

    const slug = slugify(params.name, {
      lower: true,
      strict: true, // remove special characters
      trim: true,
    });

    const checkData = await CourseModel.findOne({
      $or: [{ slug: slug }, { name: params.name }],
      _id: { $ne: params.id },
      deleteAt: null,
    });

    if (checkData) {
      return createResponse({
        status: 400,
        success: false,
        message: "Course already exists",
      });
    }
    if (params.image.length > 0) {
      if (existingCourse && existingCourse?.image?.url)
        deleteFile(existingCourse?.image?.url);
      const up = await uploadBinaryFile({
        file: params.image[0],
        folder: "courses",
      });
      params.image = up;
    } else delete params.image;
    const updatedCourse = await CourseModel.findOneAndUpdate(
      { _id: params.id },
      { ...params },
      { new: true }
    );

    return createResponse({
      status: 201,
      success: true,
      message: "Course Updated successfully",
      data: updatedCourse,
    });
  } catch (err) {
    console.error("Course Edit Error:", err);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

exports.testimonialRemoves = async (params) => {
  try {
    console.log(params);
    params.id = params.ids ? params.ids : params.id || null;
    if (!params.id) {
      return createResponse({
        status: 400,
        success: false,
        message: `ID is required`,
      });
    }

    if (Array.isArray(params.id)) {
      await testimonialModel.updateMany(
        { _id: { $in: params.id }, deletedAt: null },
        {
          deletedAt: new Date(),
          deletedBy: params.authUser ? params.authUser._id : null,
        }
      );
    } else {
      const del = await testimonialModel.updateOne(
        { _id: params.id, deletedAt: null },
        {
          $set: {
            deletedAt: new Date(),
            deletedBy: params.authUser ? params.authUser._id : null,
          },
        }
      );

      if (del.modifiedCount == 0) {
        return createResponse({
          status: 404,
          success: false,
          message: `Data not found`,
        });
      }
    }

    return createResponse({
      status: 200,
      success: true,
      message: "Data deleted successfully",
    });
  } catch (error) {
    console.error("User Delete Error:", error);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${error.message}`,
    });
  }
};

exports.StatusChange = async (params) => {
  try {
    if (!params.id) {
      return createResponse({
        status: 400,
        success: false,
        message: `ID is required`,
      });
    }
    const data = await Testimonial.findOne({
      _id: params.id,
      deleteAt: null,
    });
    if (!data) {
      return createResponse({
        status: 404,
        success: false,
        message: `Data not found`,
      });
    }
    data.status = data.status == 1 ? 2 : 1;
    data.updatedBy = params.authUser ? params.authUser._id : null;
    await data.save();
    return createResponse({
      status: 200,
      success: true,
      message: `status has been changed successfully`,
      data: data,
    });
  } catch (err) {
    console.error("Role Status Change Error:", err.message);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};
