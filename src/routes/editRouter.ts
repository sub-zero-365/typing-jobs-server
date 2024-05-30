import express from "express";
const router = express.Router();
import {getAllRelatedEdit,getStaticEdit} from "../controllers/editController.js"
import { authenticateUser } from "../middleware/authMiddleware.js";
router.get("/related/:id",authenticateUser,getAllRelatedEdit)
router.get("/:id",getStaticEdit)
export default router