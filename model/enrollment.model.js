const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const { Status } = require("../helper/typeconfig");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const enrollmentSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    guardianName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    courseId: {
      type: ObjectId,
      ref: "Courses",
      default: null,
    },
    message: {
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
    versionKey: false,
  }
);

enrollmentSchema.plugin(mongooseAggregatePaginate);

const enrollmentModel = mongoose.model("enrollments", enrollmentSchema);
module.exports = enrollmentModel;
