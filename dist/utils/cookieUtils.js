const isProduction = process.env.NODE_ENV == "production";
export const setCookies = (time = null) => {
    const obj = {
        httpOnly: isProduction,
        expires: time ? new Date(Date.now() + time) : new Date(Date.now()),
        secure: isProduction,
    };
    if (isProduction)
        obj.sameSite = "none";
    return {
        ...obj,
    };
};
//# sourceMappingURL=cookieUtils.js.map