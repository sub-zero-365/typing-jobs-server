import { UserroleTypes } from "../interfaces/models/user.js";

export type productStatesType = "pending" | "recieve" | "sent";
export type paymentStatus = "paid" | "unpaid";

interface IUserTypes {
  [key: string | number]: UserroleTypes;
}
interface IProductStates {
  [key: string | number]: productStatesType;
}
interface ITaskStates {
  [key: string | number]: paymentStatus;
}
export const USER_ROLES: IUserTypes = {
  admin: "admin",
  user: "user",
  employee: "employee",
};
export const PRODUCT_STATES: IProductStates = {
  pending: "pending",
  recieve: "recieve",
  sent: "sent",
};
export const TASK_STATES: ITaskStates = {
  paid: "paid",
  unpaid: "unpaid",
};
