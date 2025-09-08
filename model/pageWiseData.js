const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const { Status } = require("../helper/typeconfig");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { fileSchema } = require("./helper");
const pageWiseDataSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  },
  { versionKey: false }
);

pageWiseDataSchema.plugin(mongooseAggregatePaginate);

const pageWiseDataModel = mongoose.model("pageWiseDatas", pageWiseDataSchema);
module.exports = pageWiseDataModel;
