import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  deleteSessionIdService,
  getSessionsService,
} from "../services/session.service";
import { HTTPSTATUS } from "../config/http.config";
import { sessionSchema } from "../validation/session.validation";

// [GET] GET SESSIONS
export const getSessionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, sessionId } = req;

    const { sessions } = await getSessionsService(userId, sessionId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Get session successfully",
      sessions,
    });
  }
);

// [DELETE] DELETE SESSION ID
export const deleteSessionIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = sessionSchema.parse(req.params.id);
    const { userId } = req;

    await deleteSessionIdService(sessionId, userId);

    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "Session delete success" });
  }
);
