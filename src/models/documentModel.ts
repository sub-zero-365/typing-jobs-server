import { iPDFDocument } from "../interfaces/models/documentInterface.js";
import mongoose from "mongoose";
export interface iPDFDocumentModel extends mongoose.Document, iPDFDocument {}
const PDFSchema = new mongoose.Schema<iPDFDocumentModel>(
  {
    createdBy: {
      userId: {
        type: Number,
        required: [true, "please userid is require when creating an account "],
      },
    },
    employeeIds: [{ type: Number, ref: "User" }], // A
    originalFile: {
      type: String, // URL or path to the original PDF file
      required: true,
    },
    // currentFile: {
    //   type: String, // URL or path to the current version of the PDF
    //   required: true,
    // },
    storedFileName: { type: String, required: true },
    status: {
      type: String,
      enum: ["uploaded", "in-progress", "completed"],
      default: "uploaded",
    },

    edits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Edit",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PDFDocument = mongoose.model("PDFDocument", PDFSchema);
export default PDFDocument;
