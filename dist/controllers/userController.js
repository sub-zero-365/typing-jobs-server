import { StatusCodes } from "http-status-codes";
import { UnauthenticatedError } from "../errors/customErrors.js";
import userModel from "../models/userModel.js";
import { sanitizeUser } from "../utils/tokenUtils.js";
// import logisticModel from "../models/logisticModel.js";
export const currentUser = async (req, res) => {
    const { userId, role } = req?.user;
    const user = await userModel.findOne({ userId });
    if (!user)
        throw new UnauthenticatedError(`login again `);
    let Iuser = sanitizeUser(user);
    Iuser = {
        ...Iuser,
        fullname: Iuser.name,
    };
    // console.log("this is the login user", Iuser, user);
    res.status(StatusCodes.OK).json({ user: Iuser });
};
export const getAllUser = async (req, res) => {
    const { search } = req.query;
    const queryObject = {};
    if (search) {
        const userSearch = [
            {
                name: { $regex: search, $options: "i" },
            },
            {
                email: { $regex: search, $options: "i" },
            },
        ];
        // console.log(Number(search))
        queryObject.$or = [...userSearch];
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    // testing
    const totalUsers = await userModel.countDocuments(queryObject);
    const allLogististics = 8;
    const users = await userModel.aggregate([
        {
            $match: {},
        },
        {
            $lookup: {
                from: "logistics", // Lookup data from the orders collection
                localField: "userId", // Field in the users collection for joining
                foreignField: "createdBy.userId", // Field in the orders collection for joining
                as: "allusers", // Name for the joined orders data
            },
        },
        {
            $project: {
                total: { $size: "$allusers" },
                _id: 1,
                name: 1,
                email: 1,
                userId: 1,
                // password: '$2a$10$t5rlJy0PBhtTtABcRJYw.Ouuxiv.akN8zB4sMIQ7t40J1LwsHd8ji',
                role: 1,
                isVerified: 1,
                // percentage: {
                //   $cond: [
                //     { $eq: ["$total", 0] }, 1, {
                //       $multiply: [
                //         { $divide: [100, totalUsers || 1] }, "$total"
                //       ]
                //     }],
                // },
                percent: {
                    $cond: [
                        { $eq: [allLogististics, 0] },
                        0,
                        {
                            $multiply: [
                                { $divide: [100, allLogististics] },
                                { $size: "$allusers" },
                            ],
                        },
                    ],
                },
            },
        },
        { $sort: { total: -1 } },
        { $skip: skip },
        { $limit: limit },
        // {
        //   $lookup: {
        //     from: "products", // Lookup data from the products collection
        //     localField: "orders.product_id", // Field in the orders array for joining
        //     foreignField: "product_id", // Field in the products collection for joining
        //     as: "orders.productDetails", // Name for the joined product details within orders
        //   },
        // },
        // {
        //   $lookup: {
        //     from: "categories", // Lookup data from the categories collection
        //     localField: "orders.productDetails.category", // Field in the productDetails array for joining
        //     foreignField: "category_id", // Field in the categories collection for joining
        //     as: "orders.productDetails.categoryDetails", // Name for the joined category details within productDetails
        //   },
        // },
        // You can add further stages for filtering, grouping, etc.
    ]);
    // console.log("all user query here", users);
    // end testing
    // const allUsers = await userModel
    //   .find({
    //     ...queryObject,
    //   })
    //   .skip(skip)
    //   .limit(limit);
    const numberOfPage = Math.ceil(totalUsers / limit);
    res.status(200).json({ users, numberOfPage, limit, currentPage: page });
};
export const getStaticUser = async (req, res) => {
    // const { userId, role } = req?.user;
    const userId = req.params.userId;
    const user = await userModel.findOne({ userId });
    if (!user)
        throw new UnauthenticatedError(`
  couldnot found user with id ${userId}
  `);
    let Iuser = sanitizeUser(user);
    Iuser = {
        ...Iuser,
        fullname: Iuser.name,
    };
    // console.log("this is the login user", Iuser, user);
    res.status(StatusCodes.OK).json({ user: Iuser });
};
//# sourceMappingURL=userController.js.map