const FaqModel = require("../model/faq.model");
const slugify = require("slugify");
const { createResponse } = require("../utils/response");
const { convertFieldsToAggregateObject } = require("../helper/index");
const { statusSearch } = require("../helper/search");
const { ObjectId } = require("mongoose").Types;
exports.faqList = async (params) => {
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

    const myAggregate = FaqModel.aggregate([
      { $match: query },
      {
        $project: {
          ...selectProjectParams,
        },
      },
      { $match: optionalQuery },
    ]);

    const result = await FaqModel.aggregatePaginate(myAggregate, {
      offset: offset,
      limit: limit,
      sort: sortQuery,
    });

    return createResponse({
      status: 200,
      success: true,
      message: "Faq list fetched successfully",
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
exports.faqDetails = async (params) => {
  try {
    let query = { daletedAt: null };
    if (params.id) query["_id"] = params.id;

    const result = await this.faqList(query);
    return createResponse({
      status: 200,
      success: true,
      message: "Faq Details fetched successfully",
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

exports.faqAdd = async (params) => {
  try {
    const faqData = new FaqModel({
      ...params,
      createdBy: params.authUser ? params.authUser._id : null,
    });

    const savedData = await faqData.save();

    return createResponse({
      status: 201,
      success: true,
      message: "Faq created successfully",
      data: savedData,
    });
  } catch (err) {
    console.error("Faq Add Error:", err.message);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};


exports.faqEdit = async (params) => {
  try {
    console.log("faq edit",params.reply)
    if (!params.id) {
      return createResponse({
        status: 400,
        success: false,
        message: "Faq ID not provided",
      });
    }

    const checkData = await FaqModel.findOne({
      _id: params.id,
      deleteAt: null,
    });

    if (!checkData) {
      return createResponse({
        status: 400,
        success: false,
        message: "FAQ not found",
      });
    }

    const updatedCourse = await FaqModel.findOneAndUpdate(
      { _id: params.id },
      {reply:params.reply},
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
exports.faqRemoves = async (params) => {
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
      await FaqModel.updateMany(
        { _id: { $in: params.id }, deletedAt: null },
        {
          deletedAt: new Date(),
          deletedBy: params.authUser ? params.authUser._id : null,
        }
      );
    } else {
      const del = await FaqModel.updateOne(
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
    const roleData = await FaqModel.findOne({ _id: params.id, deleteAt: null });
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
