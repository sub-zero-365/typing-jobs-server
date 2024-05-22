import { paymentStatus, productStatesType } from "../../utils/constant.js";
export interface iTask {
  price: string;
  task_id: string;
  tasks: {
    description?: string;
    filePath: string;
    // avatarPublicId?: string;
  }[];
  status: productStatesType;
  paymentStatus: paymentStatus;
  createdBy: {
    userId: number;
    user: string;
  };
  descriptions?: string;
  editedBy: [
    {
      userId: number;
      user: string;
      previousFile: string;
      description?: string; //reason for the edit
      filePath: string;
    }
  ];
}
