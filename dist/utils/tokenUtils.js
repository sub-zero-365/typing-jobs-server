import jwt from "jsonwebtoken";
export const createJWT = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return token;
};
export const verifyJWT = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
};
export const sanitizeUser = (user) => {
    const _user = user.toJSON();
    delete _user.password;
    return _user;
};
//# sourceMappingURL=tokenUtils.js.map