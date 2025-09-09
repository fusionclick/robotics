const CourseModel = require("../model/course.model");
const slugify = require("slugify");
const { createResponse } = require("../utils/response");
const {
  convertFieldsToAggregateObject,
  aggregateFileConcat,
} = require("../helper/index");
const { statusSearch } = require("../helper/search");
const { deleteFile, uploadBinaryFile } = require("../utils/upload");

exports.courseList = async (params) => {
  try {
    const {
      _id = "",
      status,
      keyword,
      offset = 0,
      limit = 10,
      searchValue = "",
      selectValue = "name,category,description,price,rating,image,status,deletedAt",
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

    const myAggregate = CourseModel.aggregate([
      { $match: query },
      { $set: { "image.url": aggregateFileConcat("$image.url") } },
      {
        $project: {
          ...selectProjectParams,
        },
      },
      { $match: optionalQuery },
    ]);

    const result = await CourseModel.aggregatePaginate(myAggregate, {
      offset: offset,
      limit: limit,
      sort: sortQuery,
    });

    return createResponse({
      status: 200,
      success: true,
      message: "Course list fetched successfully",
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
exports.courseDetails = async () => {};

function validateRequiredFields(params, requiredFields) {
  for (const field of requiredFields) {
    // Check for null or undefined or empty string
    if (
      params[field] === undefined ||
      params[field] === null ||
      (typeof params[field] === "string" && params[field].trim() === "")
    ) {
      return {
        status: 400,
        success: false,
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`,
      };
    }
  }
  // If all fields are present
  return null;
}
exports.courseAdd = async (params) => {
  try {
    const requiredFields = [
      "name",
      "category",
      "description",
      "price",
      "rating",
      "image",
    ];
    const validationError = validateRequiredFields(params, requiredFields);

    if (validationError) {
      return createResponse(validationError);
    }
    const slug = slugify(params.name, {
      lower: true,
      strict: true, // remove special characters
      trim: true,
    });

    // Check for existing role by slug
    const checkData = await CourseModel.findOne({ slug, deleteAt: null });
    if (checkData) {
      return createResponse({
        status: 400,
        success: false,
        message: "Course already exists",
      });
    }
    console.log("checkData", checkData);
    if (params.image.length > 0) {
      if (checkData && checkData?.image?.url) deleteFile(checkData?.image?.url);
      const up = await uploadBinaryFile({
        file: params.image[0],
        folder: "courses",
      });
      params.image = up;
    } else delete params.image;
    const CourseData = new CourseModel({
      ...params,
      slug,
      createdBy: params.authUser ? params.authUser._id : null,
    });

    const savedCourseData = await CourseData.save();

    return createResponse({
      status: 201,
      success: true,
      message: "Course created successfully",
      data: savedCourseData,
    });
  } catch (err) {
    console.error("Role Add Error:", err.message);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};
// exports.roleAdd = async (params) => {
//   try {
//     const { name } = params;
//     if(!name){
//         return createResponse({
//             status: 400,
//             success: false,
//             message: "Name is required",
//           });
//     }
//     const checkData = await CourseModel.findOne({ name, deleteAt: null });

//       if (checkData ) {
//         return createResponse({
//           status: 400,
//           success: false,
//           message: "Role already exists",
//         });
//       }

//     const roleData = await new CourseModel({
//       ...params,
//       createdBy: params.authUser ? params.authUser._id : null,
//     });

//     const savedRole = await roleData.save();

//     return createResponse({
//       status: 201,
//       success: true,
//       message: "Role created successfully",
//       data: savedRole,
//     });
//   } catch (err) {
//     console.error("Role Add Error:", err.message);
//     return createResponse({
//       status: 500,
//       success: false,
//       message: `Server Error: ${err.message}`,
//     });
//   }
// };

exports.courseEdit = async (params) => {
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

    // Check for existing role by slug
    // const checkData = await CourseModel.findOne({
    //   slug: slug,
    //   name:params.name,
    //   _id: { $ne: params.id },
    //   deleteAt: null,
    // });
    const checkData = await CourseModel.findOne({
  $or: [
    { slug: slug },
    { name: params.name }
  ],
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

exports.courseRemoves = async (params) => {
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
      await CourseModel.updateMany(
        { _id: { $in: params.id }, deletedAt: null },
        {
          deletedAt: new Date(),
          deletedBy: params.authUser ? params.authUser._id : null,
        }
      );
    } else {
      const del = await CourseModel.updateOne(
        { _id: params.id, deletedAt: null },
        {
          $set: {
            deletedAt: new Date(),
            deletedBy: params.authUser ? params.authUser._id : null,
          },
        }
      );
      console.log(del);
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
    const roleData = await CourseModel.findOne({
      _id: params.id,
      deleteAt: null,
    });
    if (!roleData) {
      return createResponse({
        status: 404,
        success: false,
        message: `Data not found`,
      });
    }
    roleData.status = roleData.status == 1 ? 2 : 1;
    roleData.updatedBy = params.authUser ? params.authUser._id : null;
    await roleData.save();
    return createResponse({
      status: 200,
      success: true,
      message: `Role status has been changed successfully`,
      data: roleData,
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
