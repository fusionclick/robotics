const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const { Status } = require("../helper/typeconfig");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { fileSchema } = require("./helper");
const { required } = require("joi");
const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug:{
      type:String,
      required:true
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
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

courseSchema.plugin(mongooseAggregatePaginate);

const courseModel = mongoose.model("Courses", courseSchema);
module.exports = courseModel;
