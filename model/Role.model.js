const { required } = require("joi");
const mongoose = require("mongoose");
const {Status} =require("../helper/typeconfig")
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      unique: true,
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

userSchema.plugin(mongoosePaginate);

const roleModel = mongoose.model("Roles", roleSchema);
module.exports = roleModel;
