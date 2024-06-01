import express from "express";
import { createPdfDocument, editPdfDocument, getAllPdfDocuments, getStaticPdfDocument, showStats, } from "../controllers/pdfDocumentController.js";
import { authenticateUser, authorizePermissions, } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/new", authenticateUser, authorizePermissions("admin", "employee", "user"), createPdfDocument);
router.post("/new/guess", //un protected route for guess users
createPdfDocument);
router.get("/stats", authenticateUser, authorizePermissions("admin", "employee", "user"), showStats);
router.get("/", authenticateUser, authorizePermissions("admin", "employee", "user"), getAllPdfDocuments);
router
    .route("/:id")
    .get(authenticateUser, authorizePermissions("admin", "employee", "user"), getStaticPdfDocument)
    .delete(authorizePermissions("admin"), getStaticPdfDocument)
    .patch(authenticateUser, authorizePermissions("admin", "employee", "user"), editPdfDocument);
export default router;
//# sourceMappingURL=pdfDocumentRouter.js.map