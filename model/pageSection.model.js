const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const { Status } = require("../helper/typeconfig");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { fileSchema } = require("../model/helper");

const pageSectionSchema = new mongoose.Schema(
  {
    page: {
    type: ObjectId,
      ref: "Pages",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      default:null
    },
    shortDescription: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    image: {
      type: fileSchema,
      default: null,
    },
    status: { type: Number, enum: Status, default: Status[1] },
    createdBy: { type: ObjectId, ref: "Users", default: null },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    versionKey: false,
  }
);

pageSectionSchema.plugin(mongooseAggregatePaginate);

const pageSectionModel = mongoose.model("pageSections", pageSectionSchema);
module.exports = pageSectionModel;
