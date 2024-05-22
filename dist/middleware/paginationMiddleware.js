export const paginationMiddleware = (req, _res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const nPages = (n) => Math.ceil(n / limit);
    req.pagination = {
        page,
        limit,
        skip,
        nPages,
    };
    next();
};
//# sourceMappingURL=paginationMiddleware.js.map