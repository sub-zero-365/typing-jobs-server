import mongoose from "mongoose";
import { USER_ROLES } from "../utils/constant.js";
import { IUser } from "../interfaces/models/user.js";

export interface IUserModel extends mongoose.Document, IUser {
  getDefaultResultOrder(): void;
}

const UserSchema = new mongoose.Schema<IUserModel>({
  name: {
    required: [true, "please name is required  "],
    type: String,
  },
  email: String,
  userId: Number,
  password: String,
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.user,
  },
  avatar: String,
  avatarPublicId: String,
  isVerified: {
    type: Boolean,
    enum: [true, false],
    default: "false",
  },
  phoneNumber: String,
  otp: {
    // type: String, // Store the generated OTP for verification
    expiresAt: { type: Date }, // Set expiration for OTP
    value: {
      type: Number,
      default: undefined,
    },
  },
});

UserSchema.methods.toJSON = function () {
  let obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", UserSchema);
