const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const { Status } = require("../helper/typeconfig");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const testimonialSchema = new mongoose.Schema(
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
    occupation: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
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

testimonialSchema.plugin(mongooseAggregatePaginate);

const testimonialModel = mongoose.model("testimonials", testimonialSchema);
module.exports = testimonialModel;
