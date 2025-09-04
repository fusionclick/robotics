const RoleModel = require("../model/Role.model"); 
const slugify = require('slugify');
const { createResponse } = require("../utils/response");
const {
  convertFieldsToAggregateObject,
} = require("../helper/index");
const { statusSearch } = require("../helper/search");


exports.roleList = async (params) => {
  try {
    const {
      _id = "",
      status,
      keyword,
      offset = 0,
      limit = 10,
      searchValue = "",
      selectValue = "name,role,status,createdBy,deletedAt",
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

    const myAggregate = RoleModel.aggregate([
      { $match: query },  
      {
        $project: {
          ...selectProjectParams,
        },
      },
      { $match: optionalQuery },
    ]);

    const result = await RoleModel.aggregatePaginate(myAggregate, {
      offset: offset,
      limit: limit,
      sort: sortQuery,
    });

    return createResponse({
      status: 200,
      success: true,
      message: "Role list fetched successfully",
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
exports.roleDetails = async () => {};


exports.roleAdd = async (params) => {
  try {
    const { name } = params;

    if (!name) {
      return createResponse({
        status: 400,
        success: false,
        message: "Name is required",
      });
    }

   
    const role = slugify(name, {
      lower: true,
      strict: true, // remove special characters
      trim: true,
    });

    // Check for existing role by slug
    const checkData = await RoleModel.findOne({ role, deleteAt: null });

    if (checkData) {
      return createResponse({
        status: 400,
        success: false,
        message: "Role already exists",
      });
    }

    const roleData = new RoleModel({
      ...params,
      role, 
      createdBy: params.authUser ? params.authUser._id : null,
    });

    const savedRole = await roleData.save();

    return createResponse({
      status: 201,
      success: true,
      message: "Role created successfully",
      data: savedRole,
    
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
//     const checkData = await RoleModel.findOne({ name, deleteAt: null });
  
//       if (checkData ) {
//         return createResponse({
//           status: 400,
//           success: false,
//           message: "Role already exists",
//         });
//       }

//     const roleData = await new RoleModel({
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

exports.roleEdit = async () => {
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

exports.roleRemoves = async (params) => {
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
      await RoleModel.updateMany(
        { _id: { $in: params.id }, deletedAt: null },
        {
          deletedAt: new Date(),
          deletedBy: params.authUser ? params.authUser._id : null,
        }
      );
    } else {
      const del = await RoleModel.updateOne(
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
try{

  if(!params.id){
      return createResponse({
      status: 400,
      success: false,
      message: `ID is required`,
    });
  }
  const roleData=await RoleModel.findOne({_id:params.id,deleteAt:null});
  if(!roleData){
    return createResponse({
      status: 404,
      success: false,
      message: `Data not found`,
    });
  }
  roleData.status=roleData.status==1 ? 2 : 1;
  roleData.updatedBy=params.authUser ? params.authUser._id : null;
  await roleData.save();
  return createResponse({
    status: 200,
    success: true,
    message: `Role status has been changed successfully`,
    data:roleData
  });
}catch(err){
   console.error("Role Status Change Error:", err.message);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.message}`,
    });
}
}