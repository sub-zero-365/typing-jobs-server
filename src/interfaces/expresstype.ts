import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
interface IReqUser {
  userId: number;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IReqUser;
      pagination:{
        page:number,
        limit:number | null,
        skip:number,
        nPages:(n:number)=>number,
      },
      files:any[]
    }
  }
}
export type MiddlewareFn = (
  req?: Request,
  res?: Response,
  next?: NextFunction
) => Promise<void> | void;
