const pageSectionModel = require("../model/pageSection.model");
const slugify = require("slugify");
const { createResponse } = require("../utils/response");
const { convertFieldsToAggregateObject } = require("../helper/index");
const { statusSearch } = require("../helper/search");
const { uploadBinaryFile, deleteFile } = require("../utils/upload");
const { ObjectId } = require("mongoose").Types;
exports.pageSectionList = async (params) => {
  try {
    const {
      _id = "",
      status,
      keyword,
      offset = 0,
      limit = 5,
      searchValue = "",
      selectValue = "name,email,mobile,message,reply,status,createdBy,deletedAt",
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

    const myAggregate = pageSectionModel.aggregate([
      { $match: query },
      {
        $project: {
          ...selectProjectParams,
        },
      },
      { $match: optionalQuery },
    ]);

    const result = await pageSectionModel.aggregatePaginate(myAggregate, {
      offset: offset,
      limit: limit,
      sort: sortQuery,
    });

    return createResponse({
      status: 200,
      success: true,
      message: "pageSection list fetched successfully",
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
exports.pageSectionDetails = async (params) => {
  try {
    let query = { daletedAt: null };
    if (params.id) query["_id"] = params.id;

    const result = await this.faqList(query);
    return createResponse({
      status: 200,
      success: true,
      message: "pageSection Details fetched successfully",
      data:  result?.data.list[0] || {}, 
    });
  } catch (error) {
    console.error("pageSection Error:", error);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${error.message}`,
    });
  }
};

exports.pageSectionAdd = async (params) => {
  try {
;
      const { title } = params;
    
        if (!title) {
          return createResponse({
            status: 400,
            success: false,
            message: "title is required",
          });
        }
    
       
        const slugData = slugify(title, {
          lower: true,
          strict: true, // remove special characters
          trim: true,
        });
    
    //    const checkData = await pageSectionModel.findOne({ slugData, deleteAt: null });
    // if (checkData) {
    //   return createResponse({
    //     status: 400,
    //     success: false,
    //     message: "pageSection already exists",
    //   });
    // }
    if (params.image.length > 0) {
      // if (checkData && checkData?.image?.url) deleteFile(checkData?.image?.url);
      const up = await uploadBinaryFile({
        file: params.image[0],
        folder: "pageSection",
      });
      params.image = up;
    } else delete params.image;


    const data = new pageSectionModel({
      ...params,
      slug:slugData,
      createdBy: params.authUser ? params.authUser._id : null,
    })
    const savedData = await data.save();

    return createResponse({
      status: 201,
      success: true,
      message: "pageSection created successfully",
      data: savedData,
    });
  } catch (err) {
    console.error("pageSection Add Error:", err.message);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};


exports.pageSectionEdit = async (params) => {
  try {
    console.log("pageSection edit",params.reply)
    if (!params.id) {
      return createResponse({
        status: 400,
        success: false,
        message: "pageSection ID not provided",
      });
    }

    const checkData = await pageSectionModel.findOne({
      _id: params.id,
      deleteAt: null,
    });

    if (!checkData) {
      return createResponse({
        status: 400,
        success: false,
        message: "pageSection not found",
      });
    }

    const updatedCourse = await pageSectionModel.findOneAndUpdate(
      { _id: params.id },
      {reply:params.reply},
      { new: true }
    );

    return createResponse({
      status: 201,
      success: true,
      message: "pageSection Updated successfully",
      data: updatedCourse,
    });
  } catch (err) {
    console.error("pageSection Edit Error:", err);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};
exports.pageSectionRemoves = async (params) => {
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
      await pageSectionModel.updateMany(
        { _id: { $in: params.id }, deletedAt: null },
        {
          deletedAt: new Date(),
          deletedBy: params.authUser ? params.authUser._id : null,
        }
      );
    } else {
      const del = await pageSectionModel.updateOne(
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
    const roleData = await pageSectionModel.findOne({ _id: params.id, deleteAt: null });
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
      message: `pageSection status has been changed successfully`,
      data: roleData,
    });
  } catch (err) {
    console.error("pageSection Status Change Error:", err.message);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};
