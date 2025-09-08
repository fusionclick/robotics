const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const { Status } = require("../helper/typeconfig");
const pageWiseDataModel = require("../model/pageWiseData");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { fileSchema } = require("./helper");
const pageSchema = new mongoose.Schema(
  {
    pageName: {
      type: String,
      default: null,
    },
    mainPage: {
      type: String,
      default: null,
    },
    status: { type: Number, enum: Status, default: Status[1] },
    header: {
      type: String,
      default:null,
    },
    shortDescription: {
      type: String,
       default:null,
    },
    description: {
      type: String,
      default:null,
    },
    button: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    image: { type: fileSchema, default: null },
    status: { type: Number, enum: Status, default: Status[1] },
    createdBy: { type: ObjectId, ref: "Users", default: null },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: ObjectId,
      ref: "Users",
      default: null,
    },
    // pageWiseData: {
    //   type: pageWiseDataModel,
    //   default:{}
    // },
    createdBy: { type: ObjectId, ref: "Users", default: null },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    versionKey: false 
  },
);

pageSchema.plugin(mongooseAggregatePaginate);

const pageModel = mongoose.model("Pages", pageSchema);
module.exports = pageModel;
