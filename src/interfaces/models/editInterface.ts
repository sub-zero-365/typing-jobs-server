import mongoose from "mongoose";

export interface iEdit {
  readonly pdfId: mongoose.Schema.Types.ObjectId;
  employeeId: number;
  previousFile:string
  newFile:string
  editSummary?:string
}
