const Status = [1, 2, 3];
//{ ACTIVE: 1, INACTIVE: 2, PENDING: 3 } / {  accept: 1, reject: 2, pending: 3 };
const ratingNumber = [0, 1, 2, 3, 4, 5];
const UserRole = ["user", "admin", "company"]; //vendor n user roleCode : user
const gender = [null, "male", "female", "other"];
const emailVerified = [0, 1]; // 0-not verified, 1-verified
module.exports = {
  Status,
  ratingNumber,
  UserRole,
  gender,
  emailVerified
};
