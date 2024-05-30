import express from "express";
import { createPdfDocument, editPdfDocument, getAllPdfDocuments, getStaticPdfDocument, } from "../controllers/pdfDocumentController.js";
import { authenticateUser, authorizePermissions, } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/new", authenticateUser, authorizePermissions("admin", "employee", "user"), createPdfDocument);
router.get("/", getAllPdfDocuments);
router.route("/:id")
    .get(authenticateUser, authorizePermissions("admin", "employee", "user"), getStaticPdfDocument)
    .delete(authorizePermissions("admin"), getStaticPdfDocument).patch(authenticateUser, authorizePermissions("admin", "employee", "user"), editPdfDocument);
export default router;
//# sourceMappingURL=pdfDocumentRouter.js.map