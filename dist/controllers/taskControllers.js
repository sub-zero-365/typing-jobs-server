import cloudinary from "cloudinary";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError, UnauthenticatedError, } from "../errors/customErrors.js";
import { formatImage } from "../middleware/multerMiddleware.js";
import Task from "../models/taskModel.js";
import userModel from "../models/userModel.js";
import { USER_ROLES } from "../utils/constant.js";
import { generateUniqueCharacter } from "../utils/generateRandomNumbers.js";
export const createTasks = async (req, res) => {
    const { userId, role } = req.user;
    const user = await userModel.findOne({
        userId,
    });
    if (!user /*|| role === USER_ROLES.admin*/)
        throw new UnauthenticatedError(`unauthenticated error`);
    const { name } = user;
    req.body.tracking_number = await generateUniqueCharacter({
        Model: Task,
        type: "number",
        length: 10,
    });
    req.body.createdBy = {
        userId,
        user: name,
    };
    // console.log("thisisiis ", req.body);
    const descriptions = [];
    const { text } = req.body;
    const isString = typeof text == "string";
    if (req.files) {
        const files = req.files;
        for (let i = 0; i < files.length; ++i) {
            const file = files[i];
            const _file = formatImage(file);
            try {
                const response = await cloudinary.v2.uploader.upload(_file);
                const desc = {
                    imgUrl: response.secure_url,
                    avatarPublicId: response.public_id,
                    name: isString ? text : text[i],
                };
                console.log("desc", desc);
                descriptions.push(desc);
            }
            catch (err) {
                console.log("this is th error her ", err);
            }
        }
        // files.forEach(async (file: File, idx: number) => {
        //   const _file = formatImage(file);
        //   try {
        //     const response = await cloudinary.v2.uploader.upload(_file);
        //     const desc: { name?: string; imgUrl: string; avatarPublicId?: string } =
        //       {
        //         imgUrl: response.secure_url,
        //         avatarPublicId: response.public_id,
        //         name: isString ? text : text[idx],
        //       };
        //     console.log("desc", desc);
        //     descriptions.push(desc);
        //   } catch (err) {
        //     console.log("this is th error her ", err);
        //   }
        //   // const desc: { name?: string; imgUrl: string; avatarPublicId?: string } = {
        //   //   imgUrl: `some${idx}`,
        //   //   avatarPublicId: String(idx),
        //   //   name: isString ? text : text[idx],
        //   // };
        //   // newUser.avatar = response.secure_url;
        //   // newUser.avatarPublicId = response.public_id;
        //   // console.log("this is the ", _file);
        // });
        // console.log("descriptions here", descriptions);
    }
    // const tasks = true;
    console.log("description here", descriptions);
    req.body.descriptions = descriptions;
    const tasks = await Task.create(req.body);
    if (!tasks)
        throw new BadRequestError(`fail to create product something went wrong `);
    res.status(StatusCodes.CREATED).json({ tasks });
};
export const getStaticTask = async (req, res) => {
    const id = req.params.id;
    const task = await Task.findOne({ task_id: id });
    if (!task)
        throw new NotFoundError("couldnot find task with id");
    res.status(StatusCodes.OK).json({ task });
};
export const getTasks = async (req, res) => {
    const { userId, role } = req.user;
    const { search, status } = req.query;
    let _user_id = null;
    if (role == USER_ROLES.admin && req.query.userId) {
        //admin requesting info
        _user_id = Number(req.query.userId);
    }
    else {
        //user requesting info
        _user_id = Number(userId);
    }
    const queryObject = {
        "createdBy.userId": _user_id,
    };
    if (search) {
        queryObject.$or = [
            {
                name: { $regex: search, $options: "i" },
            },
            // {
            //   email: { $regex: search, $options: "i" },
            // },
        ];
        // console.log(Number(search))
    }
    // const page = Number(req.query.page) || 1;
    // const limit = Number(req.query.limit) || 20;
    // const skip = (page - 1) * limit;
    if (status && status !== "all") {
        queryObject.status = status;
    }
    const { page, limit, skip, nPages } = req.pagination;
    const tasks = await Task.find({ ...queryObject })
        .skip(skip)
        .limit(limit);
    const totalLogististics = await Task.countDocuments(queryObject);
    // const numberOfPage = Math.ceil(totalLogististics / limit);
    const numberOfPage = nPages(totalLogististics);
    res
        .json({
        tasks,
        nHits: totalLogististics,
        numberOfPage,
        limit,
        currentPage: page,
    })
        .status(StatusCodes.OK);
};
export const deleteTask = async (req, res) => {
    const id = req.params.id;
    const tasks = await Task.findOneAndDelete({
        tracking_number: id,
    });
    //   something happen and fail to delete the tasks
    // throws and error to the user trying to delete the tasks
    if (!tasks)
        throw new BadRequestError(`fail to delete tasks with ${id}`);
    res.status(StatusCodes.CREATED).json({ msg: "success" });
};
export const updateTask = async (req, res) => {
    // const {} = req.body;
    //   need lots of code here 
    const task_id = req.params.task_id;
    const tasks = await Task.findOneAndUpdate({
        task_id: task_id,
    }, {
        ...req.body,
    });
    if (!tasks)
        throw new BadRequestError("fal to update tasks with id");
    res.status(StatusCodes.OK).json({
        success: true,
    });
};
export const showStats = async (req, res) => {
    const { userId, role } = req.user;
    let _user_id = null;
    if (role == USER_ROLES.admin && req.query.userId) {
        console.log("enter here", req.query.userId, userId);
        //admin requesting info
        _user_id = Number(req.query.userId);
    }
    else {
        //user requesting info
        _user_id = userId;
    }
    console.log("_user_id outsie", _user_id);
    // const queryObject: any = {
    //   "createdBy.userId": _user_id,
    // };
    const total = await Task.countDocuments({
        "createdBy.userId": _user_id,
    });
    let stats = await Task.aggregate([
        { $match: { "createdBy.userId": _user_id } },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);
    console.log("this is the user query here ,", stats);
    stats = stats.reduce((acc, curr) => {
        const { _id: title, count } = curr;
        acc[title] = count;
        return acc;
    }, {});
    // stats=stat.reduce
    console.log("this is the reduce stat here", stats, "total", total);
    const defaultStats = {
        pending: stats.pending || 0,
        recieved: stats.recieved || 0,
        sent: stats.sent || 0,
    };
    // console.log(defaultStats, "default stats");
    // let monthlyApplications = await Job.aggregate([
    //   { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    //   {
    //     $group: {
    //       _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
    //       count: { $sum: 1 },
    //     },
    //   },
    //   { $sort: { "_id.year": -1, "_id.month": -1 } },
    //   { $limit: 6 },
    // ]);
    // console.log("this  multiplication stats here", monthlyApplications);
    // monthlyApplications = monthlyApplications
    //   .map((item) => {
    //     const {
    //       _id: { year, month },
    //       count,
    //     } = item;
    //     const date = day()
    //       .month(month - 1)
    //       .year(year)
    //       .format("MMM YY");
    //     return { date, count };
    //   })
    //   .reverse();
    // console.log("this is the multiplicatio data here", monthlyApplications);
    res.status(StatusCodes.OK).json({
        defaultStats,
        nHits: total,
    });
};
//# sourceMappingURL=taskControllers.js.map