import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import PDFDocument from "../models/documentModel.js";
import Edit from "../models/editModel.js";
import { generateKeySync } from "crypto";
import userModel from "../models/userModel.js";
export const editPdfDocument = async (req, res) => {
    const { userId } = req.user;
    const user = await userModel.findOne({ userId });
    if (!user)
        throw new NotFoundError("oops something went wrong");
    console.log("this userId", userId);
    const { params: { id }, } = req;
    const pdfDocument = await PDFDocument.findOne({ _id: id });
    if (!pdfDocument)
        throw new NotFoundError("no pdf found with the id " + id);
    if (!pdfDocument.employeeIds.includes(userId)) {
        pdfDocument.employeeIds.push(userId);
    }
    console.log("pdf document", pdfDocument);
    const previousFile = pdfDocument.edits.reverse()?.[0]; //last element of an array
    let lastEdited = null;
    if (previousFile) {
        const _previousFile = await Edit.findOne({ _id: previousFile });
        if (_previousFile)
            lastEdited = _previousFile.newFile;
    }
    // Update the document status and add history entry
    pdfDocument.status = "in-progress";
    //   const { employeeId, previousFile, newFile, editSummary } = req.body;
    let pdfEdit = null;
    console.log("last edited ", lastEdited);
    if (lastEdited) {
        pdfEdit = await Edit.create({
            previousFile: lastEdited,
            pdfId: id,
            employee: {
                fullname: user.name,
                userId: user.userId,
            },
            ...req.body,
        });
    }
    else {
        pdfEdit = await Edit.create({
            previousFile: generateKeySync("hmac", { length: 256 })
                .export()
                .toString("hex"),
            employee: {
                fullname: user.name,
                userId: user.userId,
            },
            pdfId: id,
            ...req.body,
        });
    }
    if (!pdfEdit)
        throw new BadRequestError("fail to create a pdf document");
    pdfDocument.edits.push(pdfEdit._id);
    await pdfDocument.save();
    res.status(StatusCodes.CREATED).json({ msg: true });
};
export const createPdfDocument = async (req, res) => {
    const user = req.query.login_user;
    const user_without_account_id = 1212121212;
    if (user) {
        req.body.createdBy = {
            userId: user_without_account_id,
            user: req.body.userInfo,
        };
    }
    else {
        req.body.createdBy = {
            userId: req.user.userId,
            user: req.body.userInfo,
        };
    }
    req.body.originalFile = generateKeySync("hmac", { length: 512 })
        .export()
        .toString("hex");
    req.body.storedFileName = generateKeySync("hmac", { length: 256 })
        .export()
        .toString("hex");
    const pdf = await PDFDocument.create({ ...req.body });
    if (!pdf)
        throw new BadRequestError("fail to create pdf");
    res.status(StatusCodes.CREATED).json({ msg: "success" });
};
export const deletePdfDocument = async (req, res) => {
    const { id: _id } = req.params;
    const pdfDocument = await PDFDocument.findOneAndDelete({ _id });
    if (!pdfDocument)
        throw new BadRequestError("fail to delete");
    await Edit.deleteMany({ pdfId: _id });
    res.status(StatusCodes.OK).json({ msg: true });
};
export const getStaticPdfDocument = async (req, res) => {
    const { id } = req.params;
    console.log("this is the id here ", id);
    const pdfDocument = await PDFDocument.findOne({ _id: id });
    if (!pdfDocument)
        throw new NotFoundError("no pdf found with the id " + id);
    res.status(StatusCodes.OK).json({ pdfDocument, edits: [] });
};
export const getAllPdfDocuments = async (req, res) => {
    const pdfDocuments = await PDFDocument.find();
    res.status(StatusCodes.OK).json({ pdfDocuments });
};
//# sourceMappingURL=pdfDocumentController.js.map