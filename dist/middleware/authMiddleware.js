import { UnauthenticatedError, UnauthorizedError, } from "../errors/customErrors.js";
import { verifyJWT } from "../utils/tokenUtils.js";
export const authenticateUser = (req, res, next) => {
    const { token } = req?.cookies;
    if (!token)
        throw new UnauthenticatedError("authentication invalid");
    try {
        const payload = verifyJWT(token);
        const { userId, role } = payload;
        req.user = { userId, role };
        next();
    }
    catch (error) {
        throw new UnauthenticatedError("authentication invalid");
    }
};
export const authorizePermissions = (...roles) => {
    return (req, _res, next) => {
        const userrole = req.user.role;
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
//# sourceMappingURL=authMiddleware.js.map