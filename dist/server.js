import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const isProduction = process.env.NODE_ENV == "production";
import express from "express";
import Database from "./connections/db.js";
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRouter.js";
import cors from "cors";
import { authenticateUser } from "./middleware/authMiddleware.js";
import userRouter from "./routes/userRouter.js";
import taskRouter from "./routes/taskRouter.js";
import { MONGODB_OPTIONS } from "./utils/constant.js";
const app = express();
app.use(express.json());
const __dirname = dirname(fileURLToPath(import.meta.url));
const filepath = path.resolve(__dirname, "../public/");
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use("/public", express.static(
// path.resolve(__dirname, "./dist/public/index.js")
filepath));
app.get("/hello-world", (_, res) => {
    res.send("hello world from app ");
});
app.use(`/api/v1/auth`, authRouter);
app.use(`/api/v1/users`, authenticateUser, userRouter);
app.use("/api/v1/tasks", taskRouter);
const PORT = process.env.PORT;
const db = new Database({
    options: MONGODB_OPTIONS,
    uri: !isProduction ? process.env.MONGO_URL : process.env.MONGO_URL_PRODUCTION,
});
app.use("*", async (_req, res) => {
    res.status(404).send("routes not found 404");
});
app.use(errorHandlerMiddleware);
const startserver = async () => {
    try {
        await db.connect();
        await app.listen(PORT, () => {
            console.log(`app is running on port ${PORT}/n
          view app  at http://localhost:${PORT}/hello-word
          `);
        });
    }
    catch (err) {
        console.log("Error", err);
    }
};
startserver();
//# sourceMappingURL=server.js.map