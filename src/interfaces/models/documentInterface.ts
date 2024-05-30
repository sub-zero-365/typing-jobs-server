import mongoose from "mongoose";

export interface iPDFDocument {
  createdBy: {
    readonly userId: number;
    user: any;
  };
  readonly originalFile: string;
  currentFile: string;
  edits: mongoose.Types.ObjectId[];
  employeeIds: number[];
  storedFileName: string;
  status: "uploaded" | "in-progress" | "completed";
//   history: any;
}
