import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import cloudinary from "../utils/cloudinary";
import getDataUri from "../utils/datauri";

// GET CURRENT USER
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

// UPDATE PROFILE USER
export const editProfileService = async (
  userId: string,
  body: {
    username?: string;
    bio?: string;
    gender?: string;
    profilePicture?: Express.Multer.File;
  }
) => {
  try {
    const { username, bio, gender, profilePicture } = body;

    let cloudResponse;

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      if (!fileUri) {
        throw new BadRequestException("File URI is invalid or undefined");
      }
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        username,
        profilePicture: cloudResponse?.secure_url,
        bio,
        gender,
      },
      { new: true }
    ).select("-password");

    if (!updateUser) {
      throw new BadRequestException("Update profile failed");
    }

    return {
      updateUser,
    };
  } catch (error) {
    throw error;
  }
};

// DELETE USER
export const deleteUserService = async (userId: string) => {};

// SUGGESTED USER
export const getSuggestedUsersService = async (userId: string) => {
  const suggestedUsers = await UserModel.find({ _id: { $ne: userId } }).select(
    "-password"
  );
  if (!suggestedUsers) {
    throw new BadRequestException("Currently do not have any users");
  }

  return suggestedUsers;
};

// FOLLOW OR UNFOLLOW
export const followOrUnfollowService = async (
  userId: string,
  userIdFollow: string
) => {
  if (userId === userIdFollow) {
    throw new BadRequestException("You cannot follow/unfollow yourself");
  }

  const user = await UserModel.findById(userId);
  const userFollow = await UserModel.findById(userIdFollow);

  if (!user || !userFollow) {
    throw new NotFoundException("User not found");
  }

  const isFollowing = user.following.includes(userIdFollow as any);

  if (isFollowing) {
    // Unfollow
    await Promise.all([
      UserModel.updateOne(
        { _id: userId },
        { $pull: { following: userIdFollow } }
      ),
      UserModel.updateOne(
        { _id: userIdFollow },
        { $pull: { followers: userId } }
      ),
    ]);
  } else {
    // Follow
    await Promise.all([
      UserModel.updateOne(
        { _id: userId },
        { $addToSet: { following: userIdFollow } }
      ),
      UserModel.updateOne(
        { _id: userIdFollow },
        { $addToSet: { followers: userId } }
      ),
    ]);
  }

  return {
    message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
    isFollowing: !isFollowing,
  };
};
