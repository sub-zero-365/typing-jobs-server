import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import Database from "./connections/db.js";
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
const __dirname = dirname(fileURLToPath(import.meta.url));
const filepath = path.resolve(__dirname, "../public/");
app.get("/hello-world", (_, res) => {
  res.send("hello world from app ");
});
app.use(cookieParser());
app.use(
  "/public",
  express.static(
    // path.resolve(__dirname, "./dist/public/index.js")
    filepath
  )
);
const PORT = process.env.PORT || 5000;
const db = new Database({
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    // useFindAndModify: false
  },
  uri: process.env.MONGO_URL,
});
app.use("*", async (_req, res) => {
  res.status(404).send("routes not found 404");
});
app.use(errorHandlerMiddleware)
const startserver = async (): Promise<void> => {
  try {
    await db.connect();
    await app.listen(
      PORT,
      console.log(
        `app is running on port ${PORT}/n
        view app  at http://localhost:${PORT}/hello-word
        `
      )
    );
  } catch (err: any) {
    console.log("Error", err);
  }
};
startserver();
