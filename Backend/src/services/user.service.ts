import UserModel from "../models/user.model";
import { BadRequestException } from "../utils/appError";

export const getCurrentUserService = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .populate({ path: "posts", options: { sort: { createdAt: -1 } } })
    .populate("bookmarks")
    .select("-password");
  if (!user) {
    throw new BadRequestException("User not found");
  }

  return { user };
};
