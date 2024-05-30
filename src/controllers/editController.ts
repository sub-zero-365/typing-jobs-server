import { MiddlewareFn } from "../interfaces/expresstype.js";
import Edit from "../models/editModel.js";
import { BadRequestError } from "../errors/customErrors.js";
import { StatusCodes } from "http-status-codes";

export const getAllRelatedEdit: MiddlewareFn = async (req, res) => {
  const { id } = req.params;
  const edits = await Edit.find({
    pdfId: id,
  });
  console.log("this is edits",edits)
  res.status(StatusCodes.OK).json({ edits });
};
export const getStaticEdit: MiddlewareFn = async (req, res, next) => {
  const id = req.params.id;
  const edit = await Edit.findOne({ _id: id });
  if (!edit) throw new BadRequestError("fail to get edit with id");
  res.status(StatusCodes.OK).json({ edit });
};
