const brandsModel = require("../model/brands.model");
const slugify = require("slugify");
const { createResponse } = require("../utils/response");
const {
  convertFieldsToAggregateObject,
  aggregateFileConcat,
} = require("../helper/index");
const { statusSearch } = require("../helper/search");
const { uploadBinaryFile } = require("../utils/upload");
const { ObjectId } = require("mongoose").Types;
exports.brandsList = async (params) => {
  try {
    const {
      _id = "",
      status,
      keyword,
      offset = 0,
      limit = 5,
      searchValue = "",
      selectValue = "name,description,image,status,createdBy,deletedAt",
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

    const myAggregate = brandsModel.aggregate([
      { $match: query },
      { $set: { "image.url": aggregateFileConcat("$image.url") } },
      {
        $project: {
          ...selectProjectParams,
        },
      },
      { $match: optionalQuery },
    ]);

    const result = await brandsModel.aggregatePaginate(myAggregate, {
      offset: offset,
      limit: limit,
      sort: sortQuery,
    });

    return createResponse({
      status: 200,
      success: true,
      message: "Brands list fetched successfully",
      data: {
        list: result?.docs || [],
      },
    });
  } catch (error) {
    console.error("Brands Error:", error);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${error.message}`,
    });
  }
};
exports.brandsDetails = async (params) => {
  try {
    let query = { daletedAt: null };
    if (params.id) query["_id"] = params.id;

    const result = await this.faqList(query);
    return createResponse({
      status: 200,
      success: true,
      message: "Brands Details fetched successfully",
      data: result?.data.list[0] || {},
    });
  } catch (error) {
    console.error("Brands Error:", error);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${error.message}`,
    });
  }
};

exports.brandsAdd = async (params) => {
  try {
    const { name, page } = params;
    if (!page) {
      return createResponse({
        status: 400,
        success: false,
        message: "Page Id Required",
      });
    }
    const checkData = await brandsModel.findOne({ name, deleteAt: null });
    if (params.image.length > 0) {
      if (checkData && checkData?.image?.url) deleteFile(checkData?.image?.url);
      const up = await uploadBinaryFile({
        file: params.image[0],
        folder: "brands",
      });
      params.image = up;
    } else delete params.image;
    const brandData = new brandsModel({
      ...params,
      createdBy: params.authUser ? params.authUser._id : null,
    });

    const savedData = await brandData.save();

    return createResponse({
      status: 201,
      success: true,
      message: "Brand created successfully",
      data: savedData,
    });
  } catch (err) {
    console.error("Brand Add Error:", err.message);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

exports.brandsEdit = async (params) => {
  try {
    if (!params.id) {
      return createResponse({
        status: 400,
        success: false,
        message: "Brand ID not provided",
      });
    }

    const checkData = await brandsModel.findOne({
      _id: params.id,
      deleteAt: null,
    });

    if (!checkData) {
      return createResponse({
        status: 400,
        success: false,
        message: "Brand not found",
      });
    }

    const updatedBrand = await brandsModel.findOneAndUpdate(
      { _id: params.id },
      { ...params },
      { new: true }
    );

    return createResponse({
      status: 201,
      success: true,
      message: "Brand Updated successfully",
      data: updatedBrand,
    });
  } catch (err) {
    console.error("Brand Edit Error:", err);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};
exports.brandsRemoves = async (params) => {
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
      await brandsModel.updateMany(
        { _id: { $in: params.id }, deletedAt: null },
        {
          deletedAt: new Date(),
          deletedBy: params.authUser ? params.authUser._id : null,
        }
      );
    } else {
      const del = await brandsModel.updateOne(
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
    const roleData = await brandsModel.findOne({
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
      message: `Brand status has been changed successfully`,
      data: roleData,
    });
  } catch (err) {
    console.error("Brand Status Change Error:", err.message);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};
