const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

const { fileSchema, refreshTokenSchema } = require("../model/helper");
const { Status, emailVerified, ratingNumber } = require("../helper/typeconfig");
const { ObjectId } = require("mongoose").Types;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // ensures no duplicate emails
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      default: "",
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      minlength: 6, // optional validation
    },
    image: { type: fileSchema, default: null },
    role: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },
    emailVerified: {
      type: Number,
      enum: emailVerified,
      default: emailVerified[1],
    },
    rating: { type: Number, enum: ratingNumber, default: ratingNumber[0] },
    loginType: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    blocked: {
      type: [{ type: ObjectId, ref: "Users", default: null }],
      default: null,
    },
    inviteCode: {
      type: String,
      unique: true,
    },
    status: { type: Number, enum: Status, default: Status[1] },
    createdBy: { type: ObjectId, ref: "Users", default: null },
    deletedAt: {
      type: Date,
      default: null,
    },
    refreshToken: [refreshTokenSchema],
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  },
  { versionKey: false }
);

// password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// password checking
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

userSchema.plugin(mongoosePaginate);

const userModel = mongoose.model("Users", userSchema);
module.exports = userModel;
