import {
  UnauthenticatedError,
  UnauthorizedError,
} from "../errors/customErrors.js";
import { verifyJWT } from "../utils/tokenUtils.js";
import { UserroleTypes } from "../interfaces/models/user.js";
import { Request } from "express";
export const authenticateUser = (req, res, next) => {
  const { token } = req?.cookies;
  if (!token) throw new UnauthenticatedError("authentication invalid");

  try {
    const payload = verifyJWT(token);
    const { userId, role } = payload;
    req.user = { userId, role };
    next();
  } catch (error) {
    throw new UnauthenticatedError("authentication invalid");
  }
};

export const authorizePermissions = (...roles: UserroleTypes[]):any=> {
  return (req: Request, _res, next) => {
    const userrole: UserroleTypes = req.user.role as UserroleTypes;
    if (!roles.includes(userrole)) {
      throw new UnauthorizedError("Unauthorized to access this route");
    }
    next();
  };
};

// export const checkForTestUser = (req, res, next) => {
//   if (req.user.testUser) throw new BadRequestError("Demo User. Read Only!");
//   next();
// };
