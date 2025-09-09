const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const { Status } = require("../helper/typeconfig");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const faqSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      default: null,
    },
    reply: {
      type: String,
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
  },
  { versionKey: false }
);

faqSchema.plugin(mongooseAggregatePaginate);

const faqModel = mongoose.model("Faqs", faqSchema);
module.exports = faqModel;
