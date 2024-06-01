import { MiddlewareFn } from "../interfaces/expresstype.js";
import Edit from "../models/editModel.js";
import { BadRequestError } from "../errors/customErrors.js";
import { StatusCodes } from "http-status-codes";

export const getAllRelatedEdit: MiddlewareFn = async (req, res) => {
  try {
    const page = (req.query.page as string) || "1";
    const limit = (req.query.limit as string) || "1";
    const pdfId = req.params.id;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const query: any = {};
    if (pdfId) {
      query.pdfId = pdfId;
    }

    const edits = await Edit.find(query)
      .sort({ createdAt: -1 }) // Sort in ascending order based on createdAt
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    const totalEdits = await Edit.countDocuments(query);
    const nHits = await Edit.countDocuments({ pdfId: req.params.id });

    res.status(200).json({
      totalEdits,
      totalPages: Math.ceil(totalEdits / limitNumber),
      currentPage: pageNumber,
      edits,
      nHits
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
export const getStaticEdit: MiddlewareFn = async (req, res, next) => {
  const id = req.params.id;
  const edit = await Edit.findOne({ _id: id });
  if (!edit) throw new BadRequestError("fail to get edit with id");
  res.status(StatusCodes.OK).json({ edit });
};
