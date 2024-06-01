import { comparePassword, hashPassword } from "../utils/passwordUtils.js";
import User from "../models/userModel.js";
import { BadRequestError, UnauthenticatedError, } from "../errors/customErrors.js";
import { createJWT, sanitizeUser } from "../utils/tokenUtils.js";
import { StatusCodes } from "http-status-codes";
import { USER_ROLES } from "../utils/constant.js";
import { setCookies } from "../utils/cookieUtils.js";
import { generateRandomString, generateUniqueCharacter, } from "../utils/generateRandomNumbers.js";
import dayjs from "dayjs";
import { transporter } from "../utils/sendMailUtils.js";
export const login = async (req, res) => {
    const { email, password, } = req.body;
    const user = await User.findOne({ email: email });
    const isValidUser = user && (await comparePassword(password, user.password));
    if (!isValidUser)
        throw new UnauthenticatedError("invalid credentials");
    const token = createJWT({ userId: user.userId, role: user.role });
    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie("token", token, setCookies(oneDay));
    res
        .status(StatusCodes.OK)
        .json({ msg: "user logged in", token, user: sanitizeUser(user) });
};
export const register = async (req, res) => {
    const isFirstAccount = (await User.countDocuments()) === 0;
    const userRole = req.body.role;
    req.body.role = isFirstAccount
        ? USER_ROLES.admin
        : userRole || USER_ROLES.user;
    const { password, email } = req.body;
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
        text: `Hello ${user.name},\n\nThank you for creating an account with us. To proceed further with your registration process, please enter the OTP: ${req.body.otp.value}. Please note, this OTP will only be valid for 30 minutes.`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center;">
        <h1 style="color: #4CAF50; margin-bottom: 1rem;"><b>Hi ${user.name},</b></h1>
        <h1 style="color: #4CAF50; margin-bottom: 1rem;"><b>Welcome to EASY GOODS & SERVICES</b></h1>
        <p style="font-weight: 700; font-size: 1.2rem; color: #333;">To proceed further with your registration process, please enter the OTP below.</p>
        <p style="font-weight: 300; font-size: 1rem; color: #555;">Your Email Verification OTP is:</p>
        <div style="padding: 10px 20px; background-color: #f2f2f2; border: 1px solid #ddd; display: inline-block; margin-bottom: 1rem;">
          <span style="font-size: 1.5rem; font-weight: bold; color: #333;">${req.body.otp.value}</span>
        </div>
        <p style="font-weight: 300; font-size: 1rem; color: #555;">Please note, this OTP will only be valid for 30 minutes.</p>
        <div style="margin-top: 20px;">
          <a href="https://example.com/verify" style="background: #4CAF50; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Now</a>
        </div>
        <p style="font-size: 1rem; color: #777; margin-top: 20px;">
          Best regards,<br>
          The EASY GOODS & SERVICES Team
        </p>
      </div>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
    }
    catch (err) {
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
export const verifiedUser = async (req, res) => {
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
    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie("token", token, setCookies(oneDay));
    res.status(StatusCodes.OK).json({ msg: "user logged in", token });
};
export const logout = (_, res) => {
    res.cookie("token", "logout", setCookies());
    res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};
//# sourceMappingURL=authController.js.map