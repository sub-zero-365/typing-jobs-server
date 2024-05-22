import mongoose from "mongoose";
import { PRODUCT_STATES, TASK_STATES } from "../utils/constant.js";
const iTaskSchema = new mongoose.Schema({
    price: Number,
    task_id: String,
    status: {
        type: String,
        enum: [...Object.values(PRODUCT_STATES)],
        default: "pending",
    },
    paymentStatus: {
        type: String,
        enum: [...Object.values(TASK_STATES)],
        default: "unpaid",
    },
    createdBy: {
        // userId: mongoose.Types.ObjectId,
        userId: Number,
        user: String,
    },
    descriptions: {
        type: String,
        require: false,
    },
    tasks: [
        {
            description: String,
            filePath: String,
            // avatarPublicId?: string;
        },
    ],
    editedBy: [
        {
            userId: Number,
            user: String,
            previousFile: String,
            description: String, //reason for the edit
            filePath: String,
        },
    ],
});
export default mongoose.model("Logistic", iTaskSchema);
//# sourceMappingURL=taskModel.js.map