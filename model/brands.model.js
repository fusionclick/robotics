const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const { Status } = require("../helper/typeconfig");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { fileSchema } = require("./helper");
const { required } = require("joi");
const brandsSchema = new mongoose.Schema(
  {
    page: {
      type: ObjectId,
      ref: "Pages",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: { type: String, default: null },
    image: { type: fileSchema, default: null },
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

brandsSchema.plugin(mongooseAggregatePaginate);

const brandsModel = mongoose.model("Brands", brandsSchema);
module.exports = brandsModel;
