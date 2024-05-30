import mongoose from "mongoose";
import { iEdit } from "../interfaces/models/editInterface.js";
interface iEditModel extends iEdit {}
const EditSchema = new mongoose.Schema(
  {
    pdfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PDFDocument",
      required: true,
    },
    employee: {
      fullname: { type: String, required: true },
      userId: { type: Number, ref: "User", required: true },
    },

    previousFile: {
      type: String, // URL or path to the previous version of the PDF
      // required: true,
    },
    newFile: {
      type: String, // URL or path to the new version of the PDF
      required: true,
    },
    editSummary: {
      type: String, // Description of the edits made
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Edit = mongoose.model("Edit", EditSchema);
export default Edit;
