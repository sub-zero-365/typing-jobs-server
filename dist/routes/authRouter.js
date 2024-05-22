import express from "express";
const router = express.Router();
import { login, logout, register, verifiedUser } from "../controllers/authController.js";
import { validateRegisterInput } from "../middleware/validationMiddleware.js";
router.post("/signup", validateRegisterInput, register);
router.post("/login", login);
router.get("/logout", logout);
router.route("/verified-otp").post(verifiedUser);
export default router;
//# sourceMappingURL=authRouter.js.map