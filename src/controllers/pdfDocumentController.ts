import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import { MiddlewareFn } from "../interfaces/expresstype.js";
import PDFDocument from "../models/documentModel.js";
import Edit from "../models/editModel.js";
import { generateKey, generateKeySync } from "crypto";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";
import { transporter } from "../utils/sendMailUtils.js";

export const editPdfDocument: MiddlewareFn = async (req, res) => {
  const userId = req?.user?.userId;
  const user = await userModel.findOne({ userId });
  if (!user) throw new NotFoundError("oops something went wrong");
  console.log("this userId", userId);
  const {
    params: { id },
  } = req;
  const pdfDocument = await PDFDocument.findOne({ _id: id });
  if (!pdfDocument) throw new NotFoundError("no pdf found with the id " + id);
  if (!pdfDocument.employeeIds.includes(userId)) {
    pdfDocument.employeeIds.push(userId);
  }
  console.log("pdf document", pdfDocument);
  const previousFile = pdfDocument.edits.reverse()?.[0]; //last element of an array
  let lastEdited = null;
  if (previousFile) {
    const _previousFile = await Edit.findOne({ _id: previousFile });
    if (_previousFile) lastEdited = _previousFile.newFile;
  }
  // Update the document status and add history entry
  pdfDocument.status = "in-progress";
  //   const { employeeId, previousFile, newFile, editSummary } = req.body;
  let pdfEdit: any = null;
  console.log("last edited ", lastEdited);
  if (lastEdited) {
    pdfEdit = await Edit.create({
      previousFile: lastEdited,
      pdfId: id,
      employee: {
        fullname: user.name,
        userId: user.userId,
      },
      ...req.body,
    });
  } else {
    pdfEdit = await Edit.create({
      previousFile: generateKeySync("hmac", { length: 256 })
        .export()
        .toString("hex"),
      employee: {
        fullname: user.name,
        userId: user.userId,
      },
      pdfId: id,
      ...req.body,
    });
  }
  if (!pdfEdit) throw new BadRequestError("fail to create a pdf document");
  pdfDocument.edits.push(pdfEdit._id);
  await pdfDocument.save();
  
  res.status(StatusCodes.CREATED).json({ msg: true });
};

export const createPdfDocument: MiddlewareFn = async (req, res) => {
  const guessUserFlag = req.query.guess_user;
  const loggedInUserId = req?.user?.userId;
  const guestUserId = 1234567890;
  const userData = {
    userId: guestUserId,
    user: req.body.name,
    email: req.body.email,
  };

  if (!guessUserFlag || guessUserFlag !== "guess_user" || loggedInUserId) {
    try {
      const user = await userModel.findOne({ userId: loggedInUserId });
      if (!user) throw new BadRequestError("User not found");

      userData.userId = loggedInUserId;
      userData.user = user.name;
      userData.email = user.email;
    } catch (error) {
      console.error("User lookup error:", error);
      throw new BadRequestError("Something bad happened");
    }
  }

  req.body.createdBy = userData;
  req.body.originalFile = generateKeySync("hmac", { length: 512 })
    .export()
    .toString("hex");
  req.body.storedFileName = generateKeySync("hmac", { length: 256 })
    .export()
    .toString("hex");

  const pdf = await PDFDocument.create({ ...req.body });
  if (!pdf) throw new BadRequestError("Failed to create PDF document");
  try {
    const mailOptions = {
      from: {
        name: "EASY GOODS & SERVICES",
        address: "atbistech@gmail.com",
      },
      to: [userData.email],
      subject: "Booking Confirmation - EASY GOODS & SERVICES",
      text: `Hello ${userData.user},\n\nThank you for booking with us. Your booking has been received. Your booking ID is ${pdf._id}.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h1 style="text-align: center; color: #4CAF50;">Booking Confirmation</h1>
          <p style="text-align: center; font-size: 1.2rem; color: #333;">Hi <b>${userData.user}</b>,</p>
          <p style="text-align: center; font-size: 1rem; color: #555;">
            Thank you for choosing <b>EASY GOODS & SERVICES</b>. We are pleased to confirm that your booking has been received successfully.
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <p style="font-size: 1rem; color: #333;">Your Booking ID is:</p>
            <p style="font-size: 1.5rem; font-weight: bold; color: #ffffff; background: #4CAF50; padding: 10px 20px; border-radius: 5px; display: inline-block;">
              ${pdf._id}
            </p>
          </div>
          <p style="text-align: center; font-size: 1rem; color: #555;">
            You can use this ID to track the status of your booking. If you have any questions or need further assistance, feel free to contact us at any time.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://example.com/track-booking/${pdf._id}" style="background: #4CAF50; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Track Your Booking
            </a>
          </div>
          <p style="text-align: center; font-size: 1rem; color: #777; margin-top: 20px;">
            Best regards,<br>
            The EASY GOODS & SERVICES Team
          </p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    res.status(StatusCodes.CREATED).json({ msg: "success" });
  } catch (err) {
    console.error("Email send error:", err);
    if (pdf) await pdf.deleteOne();
    throw new BadRequestError("Internal server error");
  }
};
export const deletePdfDocument: MiddlewareFn = async (req, res) => {
  const { id: _id } = req.params;
  const pdfDocument = await PDFDocument.findOneAndDelete({ _id });
  if (!pdfDocument) throw new BadRequestError("fail to delete");
  await Edit.deleteMany({ pdfId: _id });
  res.status(StatusCodes.OK).json({ msg: true });
};
export const getStaticPdfDocument: MiddlewareFn = async (req, res) => {
  const { id } = req.params;
  // console.log("this is the id here ", id);
  // const pdfDocument = await PDFDocument.findOne({ _id: id });
  // if (!pdfDocument) throw new NotFoundError("no pdf found with the id " + id);
  // res.status(StatusCodes.OK).json({ pdfDocument, edits: [] });
  const pdfDocument = await PDFDocument.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: "edits",
        localField: "edits",
        foreignField: "_id",
        as: "edits",
      },
    },
    {
      $group: {
        _id: "$_id",
        originalFile: { $first: "$originalFile" },
        storedFileName: { $first: "$storedFileName" },
        status: { $first: "$status" },
        employeeNames: { $addToSet: "$edits.employee" }, // Add here
      },
    },
    {
      $project: {
        _id: 1,
        originalFile: 1,
        storedFileName: 1,
        status: 1,
        employeeNames: 1, // Include in project if needed
      },
    },
  ]);

  if (pdfDocument.length === 0) {
    // return res.status(404).json({ message: 'PDF Document not found' });
    throw new BadRequestError("error something bad happen");
  }
  const _pdfDoc = pdfDocument[0];
  const names = [...new Set(_pdfDoc.employeeNames[0])] as any[];
  delete _pdfDoc.employeeNames;

  const uniqueObjects = [];
  const seen = {};

  for (let i = 0; i < names.length; i++) {
    const obj = names[i];
    const key = `${obj.fullname}-${obj.userId}`; // Combine properties for uniqueness
    if (!seen.hasOwnProperty(key)) {
      uniqueObjects.push(obj);
      seen[key] = true;
    }
  }
  _pdfDoc.employeeNames = uniqueObjects;
  console.log(uniqueObjects);

  res.status(StatusCodes.OK).json({ pdfDocument: pdfDocument[0], edits: [] });
};
export const getAllPdfDocuments: MiddlewareFn = async (req, res) => {
  const pdfDocuments = await PDFDocument.find();
  res.status(StatusCodes.OK).json({ pdfDocuments });
};
