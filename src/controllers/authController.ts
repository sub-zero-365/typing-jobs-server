import { MiddlewareFn } from "../interfaces/expresstype.js";
import { comparePassword, hashPassword } from "../utils/passwordUtils.js";
import User from "../models/userModel.js";
import {
  BadRequestError,
  UnauthenticatedError,
} from "../errors/customErrors.js";
import { createJWT, sanitizeUser } from "../utils/tokenUtils.js";
import { StatusCodes } from "http-status-codes";
import { USER_ROLES } from "../utils/constant.js";
import { setCookies } from "../utils/cookieUtils.js";
import {
  generateRandomString,
  generateUniqueCharacter,
} from "../utils/generateRandomNumbers.js";
import userModel from "../models/userModel.js";
import dayjs from "dayjs";
import { transporter } from "../utils/sendMailUtils.js";
export const login: MiddlewareFn = async (req, res) => {
  const {
    email,
    password,
  }: {
    email: string;
    password: string;
  } = req.body;
  const user = await User.findOne({ email: email });
  const isValidUser = user && (await comparePassword(password, user.password));
  if (!isValidUser) throw new UnauthenticatedError("invalid credentials");

  const token = createJWT({ userId: user.userId, role: user.role });
  const oneDay: number = 1000 * 60 * 60 * 24;
  res.cookie("token", token, setCookies(oneDay));

  res
    .status(StatusCodes.OK)
    .json({ msg: "user logged in", token, user: sanitizeUser(user) });
};

export const register: MiddlewareFn = async (req, res) => {
  const isFirstAccount = (await User.countDocuments()) === 0;
  const userRole = req.body.role;
  req.body.role = isFirstAccount
    ? USER_ROLES.admin
    : userRole || USER_ROLES.user;
  const { password, email }: { password: string; email: string } = req.body;
  //   prevent user from creating multi account with the same email
  if (!email || !password)
    throw new BadRequestError("please provide all fields");

  const hashedPassword = await hashPassword(password);
  req.body.password = hashedPassword;
  const userId = await generateUniqueCharacter({
    Model: User,
    type: "number",
    length: 10,
  });
  req.body.otp = {
    value: generateRandomString({ type: "number", length: 4 }),
    expiresAt: dayjs().add(10, "minute"),
  };
  const emailsList = [email];

  // console.log("this the user id", userId);
  req.body.userId = userId;
  const user = await User.create({
    ...req.body,
  });
  
  console.log("user", user);
  const mailOptions = {
    from: {
      name: "EASY GOODS & SERVICES",
      address: "atbistech@gmail.com",
    },
    to: emailsList,
    subject: "OTP Confirmation - EASY GOODS & SERVICES",
    text: `Hello ${user.name},\n\n.Thank you for creating at account with us`,
    html: `<h1 style="text-align:center;margin-bottom:1rem"><b>Hi ${user.name},</b></h1>
    <h1 style="text-align:center;margin-bottom:1rem"><b>Welcome to EASY GOODS & SERVICES </b></h1>
         <p style="text-align:center;font-weight:700">To proceed further with yiur registration process please enter the OTP.</p>
         <p style="text-align:center;font-weight:300;margin-bottom:1rem">Your Email verification OTP is </p>
         <span style="display: block;padding:1rem;width:fit;margin:1rem auto">${req.body.otp.value} </span>
         <p style="text-align:center;font-weight:300;margin-bottom:1rem">Please note this otp will only be valid for 30minutes</p>
         
      `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    // delete the user if mail fail to be sent to the user address
    await User.findOneAndDelete({ _id: user._id });
    console.log("err:", err);
    throw err;
  }
  res.status(StatusCodes.CREATED).json({
    msg: "user created",
    user: {
      email: user.email,
    },
  });
};
export const verifiedUser: MiddlewareFn = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    throw new BadRequestError("oops email or otp is required");
  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError(" Invalid email OR OTP.");
  }
  console.log("user with otp", user.otp.value);

  // Check if OTP matches and is not expired
  if (!user.otp.value || user.otp.value != otp) {
    throw new BadRequestError("otp doesnot match");
  }
  if (dayjs(user.otp.expiresAt).diff(new Date(), "hour") > 0) {
    throw new BadRequestError("oops opt expired");
  }
  // OTP verification successful, update user's verified flag
  user.isVerified = true;
  user.otp.value = undefined; // Remove OTP from user object
  await user.save();

  // User verified successfully, send response
  // res.json({ message: "Account verified successfully!" });

  const token = createJWT({
    userId: user.userId,
    role: user.role,
  });
  const oneDay: number = 1000 * 60 * 60 * 24;
  res.cookie("token", token, setCookies(oneDay));
  res.status(StatusCodes.OK).json({ msg: "user logged in", token });
};
export const logout: MiddlewareFn = (_, res) => {
  res.cookie("token", "logout", setCookies());
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};
