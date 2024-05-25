import express from "express";
import {
  currentUser,
  getAllUser,
  getStaticUser,
} from "../controllers/userController.js";
import { authorizePermissions } from "../middleware/authMiddleware.js";
import { paginationMiddleware } from "../middleware/paginationMiddleware.js";
const router = express.Router();
router
  .route("/current-user")
  .get(authorizePermissions("admin", "employee", "user"), currentUser);

router
  .route("/allusers")
  .get(authorizePermissions("admin"), paginationMiddleware, getAllUser);
router.route("/:userId").get(authorizePermissions("admin"),paginationMiddleware, getStaticUser);
export default router;
