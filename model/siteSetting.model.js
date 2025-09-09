const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const { Status } = require("../helper/typeconfig");
const { fileSchema, refreshTokenSchema } = require("../model/helper");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const social = new mongoose.Schema({
  name: {
    type: String,
    default: null,
  },
  logo: {
    type: String,
    default: null,
  },
  link: {
    type: String,
    default: null,
  },
});

const siteSettingsSchema = new mongoose.Schema(
  {
    header: {
      type: String,
      required: true,
    },
    logo: {
      type: fileSchema,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: null,
    },
    mobile: {
      type: String,
      default: "",
    },
    timing: {
      type: String,
      default: "", // fixed typo here
    },
    social: {
      type: [social],
      default: [],
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

siteSettingsSchema.plugin(mongooseAggregatePaginate);

const siteSettingModel = mongoose.model("siteSettings", siteSettingsSchema);

module.exports = siteSettingModel;
