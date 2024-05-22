import { Express } from "express-serve-static-core";
import mongoose from "mongoose"
interface TokenData {
  userId: string;
  iat: string;
}
interface IReqUser {
    userId: typeof mongoose.Types.ObjectId;
    role: string;
  }
  export interface IRequest extends Request {
    user?: IReqUser;
  }
  declare global {
    namespace Express {
        export interface Request {
            user: {
                userId: number;
                role: string;
            };
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
// declare module "express-serve-static-core" {
//   interface Request {
//     user?: IReqUser;
//   }
// }





