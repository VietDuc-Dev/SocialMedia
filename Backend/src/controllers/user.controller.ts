import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  editProfileService,
  followOrUnfollowService,
  getCurrentUserService,
  getSuggestedUsersService,
} from "../services/user.service";
import {
  updateProfileSchema,
  userIdSchema,
} from "../validation/user.validation";

// [GET] GET CURRENT USER
export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;

    const { user } = await getCurrentUserService(userId);

    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "User fetch successfully", user });
  }
);

// [POST] UPDATE PROFILE USER
export const editProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = updateProfileSchema.parse({
      ...req.body,
      profilePicture: req.file,
    });

    const userId = req.userId;

    const { updateUser } = await editProfileService(userId, result);

    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "Update profile success", updateUser });
  }
);

// [DELETE] DELETE USER
export const deleteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const accessToken = req.cookies.accessToken;
    const userId = req.userId;

    return res.status(HTTPSTATUS.OK).json({ message: "Delete user success" });
  }
);

// [GET] SUGGESTED USER
export const getSuggestedUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;

    const suggestedUsers = await getSuggestedUsersService(userId);

    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "Fetch suggested success", users: suggestedUsers });
  }
);

// [POST] FOLLOW OR UNFOLLOW
export const followOrUnfollowController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;
    const userIdFollow = userIdSchema.parse(req.params.id);

    const { message, isFollowing } = await followOrUnfollowService(
      userId,
      userIdFollow
    );

    return res.status(HTTPSTATUS.OK).json({ message: message, isFollowing });
  }
);
