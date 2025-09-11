const pageModel = require("../model/Page.model");
const pageSectionModel = require("../model/pageSection.model");

const slugify = require("slugify");
const { createResponse } = require("../utils/response");
const { convertFieldsToAggregateObject } = require("../helper/index");
const { statusSearch } = require("../helper/search");

exports.PageList = async (params) => {
  try {
    const {
      _id = "",
      status,
      keyword,
      offset = 0,
      limit = 10,
      title,
      searchValue = "",
      selectValue = "title,slug,content,status,createdBy,deletedAt",
      sortQuery = "-createdAt",
    } = params;

    const select = selectValue && selectValue.replaceAll(",", " ");
    let selectProjectParams = convertFieldsToAggregateObject(select, " ");

    let query = { deletedAt: null };
    let optionalQuery = { deletedAt: null };

    if (status) query.status = statusSearch(status);
    if (title) query.title = title;

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

    const myAggregate = pageModel.aggregate([
      { $match: query },
      {
        $project: {
          ...selectProjectParams, // Select only the necessary fields
        },
      },
      { $match: optionalQuery },
      {
        $lookup: {
          from: "pagesections",
          let: { page_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$page", "$$page_id"] } } },
            { $match: { position: 0 } },
            {
              $project: {
                _id: 1,
                title: 1,
                shortDescription: 1,
                description: 1,
                position: 1,
                image: 1,
              },
            },
          ],
          as: "carosoul",
        },
      },
      {
        $lookup: {
          from: "brands",
          let: { page_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$page", "$$page_id"] } } },
            {
              $project: {
                _id: 1,
                name: 1,
                description: 1,
                image: 1,
                status: 1,
                createdAt: 1,
              },
            },
          ],
          as: "brands",
        },
      },
      {
        $lookup: {
          from: "pagesections",
          let: { page_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$page", "$$page_id"] } } },
            { $match: { position: 1 } },
            {
              $project: {
                _id: 1,
                title: 1,
                description: 1,
                position: 1,
                image: 1,
              },
            },
          ],
          as: "ordered_sections",
        },
      },
      {
        $lookup: {
          from: "testimonials",
          let: { page_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$page", "$$page_id"] } } },
            {
              $project: {
                _id: 1,
                name: 1,
                occupation: 1,
                description: 1,
                status: 1,
                createdAt: 1,
              },
            },
          ],
          as: "testimonials",
        },
      },
      {
        $lookup: {
          from: "courses",
          let: { page_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$page", "$$page_id"] } } },
            {
              $project: {
                _id: 1,
                name: 1,
                message: 1,
                reply: 1,
                status: 1,
                createdAt: 1,
              },
            },
          ],
          as: "courses",
        },
      },
      {
        $lookup: {
          from: "faqs",
          let: { page_id: "$_id" },
          pipeline: [
             { $match: { $expr: { $eq: ["$page", "$$page_id"] } } },
            {
              $project: {
                _id: 1,
                name: 1,
                message: 1,
                reply: 1,
                status: 1,
                createdAt: 1,
              },
            },
          ],
          as: "faqs",
        },
      },
    ]);

    const result = await pageModel.aggregatePaginate(myAggregate, {
      offset: offset,
      limit: limit,
      sort: sortQuery,
    });

    return createResponse({
      status: 200,
      success: true,
      message: "Page list fetched successfully",
      data: {
        list: result?.docs || [],
        // list: myAggregate,
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
exports.PagePublic = async (params) => {
  try {
    const {
      _id = "",
      status,
      keyword,
      offset = 0,
      limit = 10,
      title,
      searchValue = "",
      selectValue = "title,slug,content,status,createdBy,deletedAt",
      sortQuery = "-createdAt",
    } = params;

    const select = selectValue && selectValue.replaceAll(",", " ");
    let selectProjectParams = convertFieldsToAggregateObject(select, " ");

    let query = { deletedAt: null };
    let optionalQuery = { deletedAt: null };

    if (status) query.status = statusSearch(status);
    if (title) query.title = title;

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

    const myAggregate = pageModel.aggregate([
      { $match: query },
      {
        $project: {
          ...selectProjectParams, // Select only the necessary fields
        },
      },
      { $match: optionalQuery },
    ]);

    const result = await pageModel.aggregatePaginate(myAggregate, {
      offset: offset,
      limit: limit,
      sort: sortQuery,
    });

    return createResponse({
      status: 200,
      success: true,
      message: "Page list fetched successfully",
      data: {
        list: result?.docs || [],
        // list: myAggregate,
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
exports.PageDetails = async () => {};

exports.PageAdd = async (params) => {
  try {
    const { title } = params;

    if (!title) {
      return createResponse({
        status: 400,
        success: false,
        message: "title is required",
      });
    }

    const pageSlug = slugify(title, {
      lower: true,
      strict: true, // remove special characters
      trim: true,
    });

    // Check for existing role by slug
    const checkData = await pageModel.findOne({ pageSlug, deleteAt: null });

    if (checkData) {
      return createResponse({
        status: 400,
        success: false,
        message: "Page name already exists",
      });
    }

    const PageData = new pageModel({
      ...params,
      slug: pageSlug,
      createdBy: params.authUser ? params.authUser._id : null,
    });

    const savedPage = await PageData.save();

    return createResponse({
      status: 201,
      success: true,
      message: "Page created successfully",
      data: savedPage,
    });
  } catch (err) {
    console.error("Page Add Error:", err.message);
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
//     const checkData = await pageModel.findOne({ name, deleteAt: null });

//       if (checkData ) {
//         return createResponse({
//           status: 400,
//           success: false,
//           message: "Role already exists",
//         });
//       }

//     const roleData = await new pageModel({
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

exports.PageEdit = async () => {
  params.user = {
    _id: "123",
    email: "user@gmail.com",
    role: "admin",
  };
  try {
    return createResponse({
      status: 200,
      message: "User Updated",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.log("User Edit Error", err.msg);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.msg}`,
    });
  }
};

exports.PageRemoves = async (params) => {
  try {
    params.id = params.id ? params.id : params.ids || null;
    if (!params.id) {
      return createResponse({
        status: 400,
        success: false,
        message: `ID is required`,
      });
    }

    if (Array.isArray(params.id)) {
      await pageModel.updateMany(
        { _id: { $in: params.id }, deletedAt: null },
        {
          deletedAt: new Date(),
          deletedBy: params.authUser ? params.authUser._id : null,
        }
      );
    } else {
      const del = await pageModel.updateOne(
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
    const roleData = await pageModel.findOne({
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
